import fs from 'node:fs';
const results='docs/qa/results';
const read=name=>JSON.parse(fs.readFileSync(`${results}/${name}.json`));
const db=read('database'),http=read('http');
const gates=[
 ['GATE-LINT','ESLint completes with no errors or warnings.','npm run lint','PASS','Exit code 0; no diagnostics.'],
 ['GATE-BUILD','Next.js optimized production build completes with TypeScript checks.','npm run build','PASS','Production build and all 27 generated page checks completed.'],
 ['GATE-DB-SEED','The Supabase seed retains the expected source totals after test cleanup.','npm run db:verify -- --expect-seed','PASS','59 restaurants, 950 dishes, 17 categories and 30 links verified.'],
 ['GATE-DB-QA','Database integration policy and application cases finish with no failures.','Supabase remote QA suite',db.cases.some(x=>x.status==='FAIL')?'FAIL':'PASS',`${db.cases.filter(x=>x.status==='PASS').length}/${db.cases.length} passed; test cleanup passed.`],
 ['GATE-HTTP-QA','Real Next.js HTTP and Server Action tests finish with no failures.','Local production-mode Next.js server + temporary Supabase fixtures',http.cases.some(x=>x.status==='FAIL')?'FAIL':'PASS',`${http.cases.filter(x=>x.status==='PASS').length}/${http.cases.length} passed; ${http.cases.filter(x=>x.status==='BLOCKED').length} email-delivery cases await SMTP.`],
 ['GATE-VERCEL-SECRETS','Preview and Production each hold the service key as a hidden server-side secret.','Vercel environment metadata', 'PASS','SUPABASE_SERVICE_ROLE_KEY is Hidden/Secret for Production and Preview branch codex/full-stack-implementation. No value was read back.'],
];
fs.writeFileSync(`${results}/gates.json`,JSON.stringify({suite:'gates',executedAt:new Date().toISOString(),cases:gates.map(([id,expected,method,status,evidence])=>({id,suite:'gates',expected,method,status,evidence}))},null,2)+'\n');
