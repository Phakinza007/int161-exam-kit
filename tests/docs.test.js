import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
async function sourceFiles(dir='.'){
 const result=[];
 for(const e of await readdir(dir,{withFileTypes:true})){
  if(['node_modules','.git','artifacts','.superpowers'].includes(e.name))continue;
  const path=join(dir,e.name);
  if(e.isDirectory())result.push(...await sourceFiles(path));else result.push(path);
 }
 return result;
}
test('Markdown guides resolve local links; six task solutions are ordinary JS; study UI is optional',async()=>{
 const files=await sourceFiles();assert.ok(files.includes('local-study/index.html'));
 for(const path of files.filter(p=>p.endsWith('.md'))){const source=await readFile(path,'utf8');for(const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)){if(!/^(https?:|#)/.test(match[1]))await access(resolve(dirname(path),match[1].split('#')[0]));}}
 const guides=files.filter(p=>p.startsWith('guides/operations/')&&p.endsWith('.md'));assert.equal(guides.length,6);
 assert.ok(!files.some(p=>p.startsWith('src/controllers-$id/')));
 const route=await readFile('src/routes-$id/route.js','utf8');
 for(const method of ['get','post','put','delete'])assert.ok(route.includes('router.'+method+'('));
 for(const core of ['src/app.js','src/test-service.js','src/routes-$id/route.js','src/services-$id/service.js','src/repositories-$id/repository.js','src/mappers-$id/entity-dto-mapper.js','src/middlewares-$id/pagination-middleware.js'])await access(core);
});
