import fs from 'node:fs';
import path from 'node:path';
export function report(suite) {
  const cases=[];
  async function run(id,expected,fn,method='Supabase Data API') {
    const started=Date.now();
    try {const evidence=await fn(); cases.push({id,suite,expected,method,status:'PASS',evidence:typeof evidence==='string'?evidence:'All assertions passed',durationMs:Date.now()-started}); console.log(`PASS ${id}: ${expected}`);}
    catch (error) {const reason=error?.name==='AssertionError' ? error.message.split('\n')[0] : 'Request or prerequisite failed';cases.push({id,suite,expected,method,status:'FAIL',evidence:reason,durationMs:Date.now()-started});console.log(`FAIL ${id}: ${expected} (${reason})`);}
  }
  function blocked(id,expected,reason,method='External configuration') {cases.push({id,suite,expected,method,status:'BLOCKED',evidence:reason});}
  function save() {const dir=path.resolve('docs/qa/results');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,`${suite}.json`),JSON.stringify({suite,executedAt:new Date().toISOString(),cases},null,2)+'\n');}
  return {run,blocked,save,cases};
}
