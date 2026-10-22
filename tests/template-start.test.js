import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,symlink,writeFile,rm,readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync,spawnSync} from 'node:child_process';
async function verify(brokenServer=false){
 const temp=await mkdtemp(join(tmpdir(),'int161-start-regression-'));
 try{
  const fixture=join(temp,'kit');
  for(const name of ['src','sql','scripts','tests','requests'])await cp(name,join(fixture,name),{recursive:true});
  await cp('package.json',join(fixture,'package.json'));await symlink(resolve('node_modules'),join(fixture,'node_modules'),'dir');
  if(brokenServer){const appPath=join(fixture,'src/app.js');const source=await readFile(appPath,'utf8');await writeFile(appPath,source.replace('const config=loadSettings(),db=createDb(config);',"throw new Error('ENTRYPOINT_REGRESSION');\nconst config=loadSettings(),db=createDb(config);"));}
  const pkg=JSON.parse(await readFile('package.json','utf8'));
  const teacher={name:'teacher-template',type:'module',private:true,scripts:{test:'node --version'},dependencies:pkg.dependencies};
  const archive=join(temp,'teacher.zip');
  execFileSync('python3',['-c',"import zipfile,sys\nwith zipfile.ZipFile(sys.argv[1],'w') as z: z.writestr('node-express-esm-template/package.json',sys.argv[2])",archive,JSON.stringify(teacher)]);
  const env={...process.env};delete env.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath,['scripts/verify-template.mjs','--template',archive],{cwd:fixture,env,encoding:'utf8',timeout:20000});
 }finally{await rm(temp,{recursive:true,force:true});}
}
test('teacher template missing start script is patched and launched through real npm start',async()=>{
 const r=await verify();assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/npm start.*HTTP 200/);
});
test('template verification rejects a broken app.js entry even when app factory contracts pass',async()=>{
 const r=await verify(true);assert.notEqual(r.status,0,'factory-only validation must not report a broken server as passing');assert.match(r.stderr,/npm start exited before readiness/);
});
