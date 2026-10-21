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
  assert.ok(files.some(f=>f.path==='POSTMAN.md'));assert.ok(files.some(f=>f.path==='src/services-$id/catalog-service.js'));
  assert.ok(!files.some(f=>f.path==='.env'||f.path.includes('node_modules')));
  for(const path of ['/.env','/src/server.js','/download?file=.env','/download?file=..%2Fpackage.json'])assert.equal((await fetch(base+path)).status,404);
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
 assert.equal(context.sectionFor('POSTMAN.md'),'postman');assert.equal(context.sectionFor('src/services-$id/catalog-service.js'),'source');
 assert.match(context.sourceLayer('src/services-$id/catalog-service.js'),/Service/);
 assert.equal(context.titleFor('guides/operations/01-create-product.md'),'C1 · เพิ่มข้อมูลสินค้า');
});
