import {mkdtemp,readFile,cp,symlink,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync,spawnSync,spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {loadSettings} from '../src/configs-$id/settings.js';
const index=process.argv.indexOf('--template');
if(index<0||!process.argv[index+1]){console.error('Usage: npm run verify:template -- --template /absolute/path/teacher-template.zip');process.exit(1);}
const root=fileURLToPath(new URL('../',import.meta.url));const temp=await mkdtemp(join(tmpdir(),'int161-template-'));
try{
 execFileSync('python3',['-c',`import zipfile,pathlib,sys
with zipfile.ZipFile(sys.argv[1]) as z:
 for i in z.infolist():
  p=pathlib.PurePosixPath(i.filename)
  if p.is_absolute() or '..' in p.parts or '\\\\' in i.filename: raise ValueError('Unsafe ZIP path')
  if '__MACOSX' in p.parts or p.name=='.DS_Store': continue
  if (i.external_attr >> 16)&0o170000==0o120000: raise ValueError('ZIP symlink rejected')
  z.extract(i,sys.argv[2])`,resolve(process.argv[index+1]),temp]);
 const target=join(temp,'node-express-esm-template');
 const pkg=JSON.parse(await readFile(join(target,'package.json'),'utf8'));
 if(pkg.type!=='module'||!pkg.dependencies?.express?.match(/^\^?5\./)||!pkg.dependencies?.mysql2?.match(/^\^?3\./)||!pkg.dependencies?.['http-status']?.match(/^\^?2\./))throw new Error('Unexpected teacher template dependencies; inspect before migrating');
 const source=join(root,'src');
 const files=['app.js','test-service.js','configs-$id','routes-$id','services-$id','repositories-$id','mappers-$id','middlewares-$id'];
 for(const name of files)await cp(join(source,name),join(target,'src',name),{recursive:true});
 await symlink(join(root,'node_modules'),join(target,'node_modules'),'dir');
 // Apply the documented package patch only to this disposable copy. Preserve all other scripts/dependencies.
 pkg.scripts={...pkg.scripts,start:'node --env-file-if-exists=.env src/app.js'};
 await writeFile(join(target,'package.json'),JSON.stringify(pkg,null,2)+'\n');
 const childEnv={...process.env};delete childEnv.NODE_TEST_CONTEXT;
 const result=spawnSync(process.execPath,['--test','tests/integration.test.js'],{cwd:root,env:{...childEnv,KIT_VERIFY_APP_URL:pathToFileURL(join(target,'src/app.js')).href},stdio:'inherit'});
 if(result.status!==0)throw new Error('Migrated teacher-template contracts failed');
 const config=loadSettings();
 // The preceding suite initialized only this guarded test database. Never start against an arbitrary exam DB.
 const portServer=createServer();await new Promise((resolve,reject)=>{portServer.once('error',reject);portServer.listen(0,'127.0.0.1',resolve);});
 const port=portServer.address().port;await new Promise(resolve=>portServer.close(resolve));
 const startupEnv={...childEnv,DB_MODE:'practice',DB_NAME:config.testDatabase,PORT:String(port),STUDENT_ID:'demo001',STUDENT_NAME:'Demo Student',STUDENT_KEY:'fictional-key'};
 const args=process.env.npm_execpath?[process.env.npm_execpath,'start']:['start'];
 const command=process.env.npm_execpath?process.execPath:(process.platform==='win32'?'npm.cmd':'npm');
 const child=spawn(command,args,{cwd:target,env:startupEnv,detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']});
 let logs='',exited=false;
 child.stdout.on('data',c=>{logs=(logs+c).slice(-6000);});child.stderr.on('data',c=>{logs=(logs+c).slice(-6000);});
 const finished=new Promise(resolve=>child.once('exit',()=>{exited=true;resolve();}));
 try{
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('npm start readiness timed out')),8000);
   const ready=()=>{if(logs.includes('Template API:')){clearTimeout(timer);resolve();}};
   child.stdout.on('data',ready);
   child.once('error',err=>{clearTimeout(timer);reject(err);});
   child.once('exit',()=>{clearTimeout(timer);reject(new Error('npm start exited before readiness'));});
  });
  const base=`http://127.0.0.1:${port}/api/demo001`;
  const identity=await fetch(base+'/student-info',{signal:AbortSignal.timeout(3000)});
  const info=await identity.json();
  if(identity.status!==200||info.data?.studentId!=='demo001')throw new Error('npm start identity probe failed');
  const response=await fetch(base+'/products',{signal:AbortSignal.timeout(3000)});const data=await response.json();
  if(response.status!==200||!Array.isArray(data.data)||data.pagination?.limit!==10)throw new Error('npm start products probe failed');
  console.log('PASS: npm start in disposable teacher template; identity/products HTTP 200');
 }finally{
  if(!exited && child.pid){
   if(process.platform==='win32')child.kill('SIGTERM');else{try{process.kill(-child.pid,'SIGTERM');}catch(e){if(e.code!=='ESRCH')throw e;}}
   let timer;await Promise.race([finished,new Promise(resolve=>{timer=setTimeout(()=>{if(!exited){if(process.platform==='win32')child.kill('SIGKILL');else{try{process.kill(-child.pid,'SIGKILL');}catch{}}}resolve();},2000);})]);clearTimeout(timer);
  }
 }
 console.log('PASS: disposable teacher template; package start patched; real-MySQL contracts and runtime entry checked');
}finally{await rm(temp,{recursive:true,force:true});}
