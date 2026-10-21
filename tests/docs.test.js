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
 const solutions=files.filter(p=>p.startsWith('src/controllers-$id/')&&p.endsWith('.js'));assert.equal(solutions.length,6);
 for(const path of solutions){assert.match(await readFile(path,'utf8'),/export function/);await access('guides/operations/'+path.split('/').pop().replace('.js','.md'));}
});
