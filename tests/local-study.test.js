import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
import {createStudyServer} from '../local-study/server.mjs';
test('local desk serves docs/source and downloads without exposing arbitrary files',async()=>{
 const server=createStudyServer().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  const home=await fetch(base);assert.equal(home.status,200);assert.match(home.headers.get('content-security-policy'),/connect-src 'self'/);
  assert.match(await home.text(),/Postman/);
  const files=await (await fetch(base+'/api/library')).json();
  assert.ok(files.some(f=>f.path==='POSTMAN.md'));assert.ok(files.some(f=>f.path==='src/services-$id/service.js'));
  assert.ok(!files.some(f=>f.path==='.env'||f.path.includes('node_modules')));
  for(const path of ['/.env','/src/app.js','/download?file=.env','/download?file=..%2Fpackage.json'])assert.equal((await fetch(base+path)).status,404);
  const download=await fetch(base+'/download?file=requests%2Fpostman.json');assert.equal(download.status,200);assert.match(download.headers.get('content-disposition'),/attachment/);assert.ok((await download.json()).item.length>0);
  assert.equal((await fetch(base+'/api/library',{method:'POST'})).status,405);
 }finally{await new Promise(r=>server.close(r));}
});
test('offline reader renders escaped Markdown and colored code with no remote assets',async()=>{
 const js=await readFile('local-study/app.js','utf8');const context={URL};new Script(js.slice(0,js.indexOf("document.addEventListener('click'"))).runInNewContext(context);
 const out=context.markdown('# Guide\n\n<script>alert(1)</script>\n\n```js\nconst price = 10;\n```\n\n[x](javascript:alert(1))','GUIDE.md');
 assert.match(out,/<h1>Guide<\/h1>/);assert.ok(!out.includes('<script>'));assert.ok(!out.includes('href="javascript:'));assert.match(out,/tok-keyword/);assert.match(out,/tok-number/);
 const html=await readFile('local-study/index.html','utf8');assert.doesNotMatch(html,/(?:src|href)="https?:/);new Script(js);
});
test('organized navigation covers actual library files and home shortcuts resolve',async()=>{
 const {getLibrary}=await import('../local-study/server.mjs');const files=await getLibrary();
 const js=await readFile('local-study/app.js','utf8');const context={URL};new Script(js.slice(0,js.indexOf("document.addEventListener('click'"))).runInNewContext(context);
 const known=new Set(['start','tasks','topics','postman','debug','source']);
 for(const file of files){assert.ok(known.has(context.sectionFor(file.path)));assert.ok(context.titleFor(file.path));}
 const html=await readFile('local-study/index.html','utf8');for(const match of html.matchAll(/data-open="([^"]+)"/g))assert.ok(files.some(f=>f.path===match[1]),match[1]);
 assert.equal((html.match(/class="task-card"/g)||[]).length,6);
 assert.equal(context.sectionFor('POSTMAN.md'),'postman');assert.equal(context.sectionFor('src/services-$id/service.js'),'source');
 assert.match(context.sourceLayer('src/services-$id/service.js'),/Service/);
 assert.equal(context.titleFor('guides/operations/01-create-product.md'),'C1 · เพิ่มข้อมูลสินค้า');
});
test('language-aware colors preserve shell URLs, JSON properties and original source text',async()=>{
 const js=await readFile('local-study/app.js','utf8');const context={URL};new Script(js.slice(0,js.indexOf("document.addEventListener('click'"))).runInNewContext(context);
 const raw='git clone https://github.com/Phakinza007/int161-exam-kit.git\nnpm ci\n# prepare';
 const shell=context.highlight(raw,'bash');assert.match(shell,/tok-url/);assert.match(shell,/<span class="tok-keyword">git<\/span>/);assert.ok(!shell.includes('tok-comment">//'));
 const restored=shell.replace(/<span class="tok-[a-z]+">|<\/span>/g,'').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&gt;','>').replaceAll('&lt;','<').replaceAll('&amp;','&');assert.equal(restored,raw);
 assert.match(context.highlight('{"name":"Demo","age":20}','json'),/tok-property/);
 const md=context.markdown('```sh\nnpm start\n```','START-HERE.th.md');assert.match(md,/code-language">SH/);assert.match(md,/tok-keyword/);
});
test('all diagram nodes link to bundled files and HTTP handling stays in teacher route.js',async()=>{
 const {getLibrary}=await import('../local-study/server.mjs');const files=await getLibrary();const js=await readFile('local-study/app.js','utf8');const context={URL};new Script(js.slice(0,js.indexOf("document.addEventListener('click'"))).runInNewContext(context);
 for(const kind of ['overview','setup','pagination','dto','error','postman']){
  const html=context.diagramMarkup(kind,'guides/operations/01-create-product.md');
  for(const link of html.matchAll(/href="#file=([^"]+)"/g))assert.ok(files.some(f=>f.path===decodeURIComponent(link[1])));
 }
 const create=context.diagramMarkup('overview','guides/operations/01-create-product.md');assert.ok(create.includes(encodeURIComponent('src/routes-$id/route.js')));
 assert.match(context.diagramMarkup('dto','GUIDE.md'),/Mapper/);assert.equal(context.diagramFor('START-HERE.th.md'),'setup');
});
test('six-step learning path has real chapters, readable checkpoints and safe local progress',async()=>{
 const {getLibrary}=await import('../local-study/server.mjs');const files=await getLibrary();const js=await readFile('local-study/app.js','utf8');
 const memory=new Map();const context={URL,localStorage:{getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)}};
 const prefix=js.slice(0,js.indexOf("document.addEventListener('click'"));new Script(prefix).runInNewContext(context);
 assert.equal(context.loadProgress().size,0);
 context.localStorage.setItem('int161-walkthrough-v1',JSON.stringify(['START-HERE.th.md','missing.md']));assert.equal(context.loadProgress().size,1);
 context.localStorage.setItem('int161-walkthrough-v1','{broken');assert.equal(context.loadProgress().size,0);
 const chapters=files.filter(f=>f.path==='START-HERE.th.md'||f.path.startsWith('guides/walkthrough/'));assert.equal(chapters.length,6);
 for(const chapter of chapters){assert.equal(context.sectionFor(chapter.path),'start');assert.match(chapter.content,/Self-check/);for(const label of ['ทำที่ไหน','ทำอะไร','ควรเห็น','ถ้าไม่ผ่าน'])assert.ok(chapter.content.includes(label),chapter.path+': '+label);}
});
test('overall CRUD traces mark database writes accurately and stop error branches before mutation',async()=>{
 const source=await readFile('local-study/app.js','utf8');const scenarios=JSON.parse(source.match(/const overallScenarios = (.*);\n/)[1]);
 const {getLibrary}=await import('../local-study/server.mjs');const files=new Set((await getLibrary()).map(f=>f.path));
 for(const [key,scene] of Object.entries(scenarios)){
  for(const step of scene.steps)assert.ok(files.has(step.file),key+': '+step.file);
  for(const step of scene.steps.filter(s=>s.changes))assert.equal(step.stage,'db');
  assert.ok(scene.steps.at(-1).status);
 }
 for(const [key,operation] of [['c1','INSERT'],['u1','UPDATE'],['d1','DELETE']]){
  assert.equal(scenarios[key].write,operation);assert.equal(scenarios[key].steps.filter(s=>s.changes).length,1);
 }
 for(const key of ['r1','r2','r3','c1-invalid','c1-duplicate','r3-missing'])assert.ok(!scenarios[key].steps.some(s=>s.changes));
 assert.ok(!scenarios.d1.steps.some(s=>s.stage==='mapper'));assert.equal(scenarios.d1.steps.at(-1).status,204);
 assert.ok(!scenarios['r3-missing'].steps.some(s=>s.stage==='mapper'));assert.equal(scenarios['c1-invalid'].steps.at(-1).status,400);
 assert.equal(scenarios['c1-duplicate'].steps.at(-1).status,409);assert.equal(scenarios['r3-missing'].steps.at(-1).status,404);
 assert.ok(!JSON.parse(scenarios['c1-invalid'].steps[0].input).ram_gb);
 const context={URL};new Script(source.slice(0,source.indexOf("document.addEventListener('click'"))).runInNewContext(context);
 assert.equal(context.overallState('c1',999).step.status,201);assert.equal(context.overallState('c1',-3).index,0);
});
