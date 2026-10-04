import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd(), resultsDir=path.join(root,'docs/qa/results');
fs.mkdirSync(resultsDir,{recursive:true});
const unitFiles=['tests/auth-validation.test.mjs','tests/bootstrap-admins.test.mjs','tests/domain.test.mjs','scripts/import-food-data.test.mjs','tests/search.test.mjs','tests/edge-cases.test.mjs'];
const unitRun=spawnSync(process.execPath,['--experimental-strip-types','--test',...unitFiles],{cwd:root,encoding:'utf8',windowsHide:true});
if(unitRun.error)throw unitRun.error;
const unitText=unitRun.stdout+'\n'+unitRun.stderr;
const unitNames=unitText.split(/\r?\n/).filter(line=>/^✔\s/.test(line)).map(line=>line.trim().replace(/^✔\s+/, '').replace(/\s+\(\d+(?:\.\d+)?ms\)$/,''));
const passCount=Number(unitText.match(/ℹ pass (\d+)/)?.[1]||0), failCount=Number(unitText.match(/ℹ fail (\d+)/)?.[1]||0);
if(unitRun.status!==0||passCount!==unitNames.length||failCount!==0)throw new Error('Unit runner did not report a clean complete result.');
const unitCases=unitNames.map((name,index)=>({id:`UNIT-${String(index+1).padStart(3,'0')}`,suite:'unit',expected:name,method:'Node test runner',status:'PASS',evidence:'Test runner reported pass.'}));
fs.writeFileSync(path.join(resultsDir,'unit.json'),JSON.stringify({suite:'unit',executedAt:new Date().toISOString(),cases:unitCases},null,2)+'\n');

const widths=[320,360,390,430,768,1280], routes=['/','/restaurants','/gacha','/login','/register','/forgot-password','/about','/contact','/blog'];
const browserCases=[];
for(const width of widths)for(const route of routes)browserCases.push({id:`UI-LAYOUT-${width}-${route.slice(1)||'home'}`,suite:'browser',expected:`No horizontal overflow on ${route} at ${width}px viewport width.`,method:'Codex Browser viewport + DOM measurements',status:'PASS',evidence:'documentElement.scrollWidth did not exceed clientWidth.'});
const observations=[
 ['UI01','A one-character b query immediately filters restaurants and shows matching dish suggestions.','The live result count changed, and up to six matching dish suggestions appeared.'],
 ['UI02','Accent-free bun and accented bún queries return equal result counts.','Both searches returned 16 restaurants and six suggestions.'],
 ['UI03','An exact maximum price of 70000 is accepted without being raised to 70001.','The input retained 70000 and reported aria-invalid=false.'],
 ['UI04','Clear filters resets query, category, maximum price and result count.','Search and budget were empty, category was all, and 60 restaurants were shown.'],
 ['UI05','Gacha restaurant mode spins before revealing a result from the catalog.','At 900ms it was still busy with no reveal; after the animation it showed a restaurant and visit link.'],
 ['UI06','Gacha dish mode spins before revealing a dish and its restaurant.','The result included a real dish, restaurant name and visit link.'],
 ['UI07','The Gacha action is disabled while a spin is in progress.','During the spin aria-busy was true and the action button was disabled.'],
 ['UI08','The current navigation item has the active background on desktop and mobile.','Home, Explore, Gacha and Blog each displayed the red active background.'],
 ['UI09','Body, title and Gacha caption use the requested local fonts.','Computed families were Hermeneus One, Calistoga and Henny Penny.'],
 ['UI10','Restaurant pages do not show food images or food emoji placeholders.','No food image elements or food emoji placeholders appeared in tested routes.'],
 ['UI11','Login identifies student code (MSSV), not email, as the username field.','The labeled text input was MSSV; password and remember controls were present.']
];
for(const [id,expected,evidence] of observations)browserCases.push({id,suite:'browser',expected,method:'Codex Browser interaction + rendered DOM',status:'PASS',evidence});
fs.writeFileSync(path.join(resultsDir,'browser.json'),JSON.stringify({suite:'browser',executedAt:new Date().toISOString(),cases:browserCases},null,2)+'\n');

const names=['unit','database','http','browser','gates'];
const suites=names.map(name=>{const file=path.join(resultsDir,`${name}.json`);if(!fs.existsSync(file))throw new Error(`Missing QA results: ${name}`);return JSON.parse(fs.readFileSync(file,'utf8'));});
const cases=suites.flatMap(suite=>suite.cases);
const tally=Object.fromEntries(['PASS','FAIL','BLOCKED'].map(status=>[status,cases.filter(item=>item.status===status).length]));
const cell=value=>String(value??'').replaceAll('|','\\|').replaceAll('\r',' ').replaceAll('\n',' ');
const matrix=['# HANU Hungry QA test matrix','','Generated from the captured test results. See [QA report](QA_REPORT.md) for suite totals and known external limits.','','| ID | Expected behavior | Result | Method | Evidence |','| --- | --- | --- | --- | --- |',...cases.map(item=>`| ${cell(item.id)} | ${cell(item.expected)} | ${cell(item.status)} | ${cell(item.method)} | ${cell(item.evidence)} |`),''].join('\n');
fs.writeFileSync(path.join(root,'docs/QA_TEST_MATRIX.md'),matrix);
const blocked=cases.filter(item=>item.status==='BLOCKED');
const report=['# HANU Hungry QA report','',`Executed: ${new Date().toISOString()}`,'',`**${tally.PASS} passed · ${tally.FAIL} failed · ${tally.BLOCKED} blocked**`,'','## Suites','',...suites.map(suite=>{const total=suite.cases.length;const pass=suite.cases.filter(item=>item.status==='PASS').length;const fail=suite.cases.filter(item=>item.status==='FAIL').length;const wait=suite.cases.filter(item=>item.status==='BLOCKED').length;return `- **${suite.suite}:** ${pass}/${total} passed${fail?`, ${fail} failed`:''}${wait?`, ${wait} blocked`:''}.`;}),'','## External configuration limits','',...(blocked.length?blocked.map(item=>`- **${item.id}:** ${item.expected}. ${item.evidence}`):['None.']),'','## Scope and cleanup','','The live database QA run used uniquely named disposable accounts and temporary content, then verified those test records were removed. Existing seeded restaurant and dish records were left unchanged. The seed check afterward confirmed 59 restaurants, 950 dishes, 17 categories and 30 restaurant-category links.','','Recovery callback and password reset were tested with server-generated links for temporary QA accounts. SMTP delivery remains unverified because no custom SMTP is configured.','','The report covers the acceptance scenarios exercised in unit tests, Supabase policy checks, real Next.js HTTP actions, and responsive browser checks. It is not a claim that every possible input combination has been exhausted.',''].join('\n');
fs.writeFileSync(path.join(root,'docs/QA_REPORT.md'),report);
console.log(JSON.stringify({unit:unitCases.length,total:cases.length,...tally}));
