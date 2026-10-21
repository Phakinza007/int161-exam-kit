'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function highlight(text){
 const keywords=new Set('import from export default const let var function async await return if else throw new class extends super try catch finally for of in while null undefined true false SELECT FROM WHERE JOIN ON AS INSERT INTO VALUES UPDATE SET DELETE ORDER BY ASC DESC LIMIT OFFSET COUNT CREATE TABLE PRIMARY KEY NOT NULL UNIQUE'.split(' '));
 const pattern=/(\/\*[\s\S]*?\*\/|\/\/[^\n]*|--[^\n]*|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g;
 let out='',last=0;for(const m of text.matchAll(pattern)){out+=esc(text.slice(last,m.index));const t=m[0];let cls=t.startsWith('//')||t.startsWith('/*')||t.startsWith('--')?'comment':/^["'`]/.test(t)?'string':/^\d/.test(t)?'number':keywords.has(t)?'keyword':/^\s*\(/.test(text.slice(m.index+t.length))?'function':'';out+=cls?`<span class="tok-${cls}">${esc(t)}</span>`:esc(t);last=m.index+t.length;}return out+esc(text.slice(last));
}
let library=[],currentPath='';
function resolveLink(target,from){const url=new URL(target,'http://local/'+from);return {path:decodeURIComponent(url.pathname.slice(1)),hash:url.hash};}
function inline(text,path){
 const rx=/(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;let result='',pos=0;
 for(const m of text.matchAll(rx)){result+=esc(text.slice(pos,m.index));const t=m[0];if(t[0]==='`')result+='<code>'+esc(t.slice(1,-1))+'</code>';else if(t.startsWith('**'))result+='<strong>'+esc(t.slice(2,-2))+'</strong>';else{const link=t.match(/^\[([^\]]+)\]\(([^)]+)\)$/);const target=link[2];if(/^https?:\/\//.test(target))result+=`<a href="${esc(target)}" target="_blank" rel="noreferrer">${esc(link[1])} ↗</a>`;else{const r=resolveLink(target,path);const found=library.find(f=>f.path===r.path);const folder=library.find(f=>f.path.startsWith(r.path.replace(/\/$/,'')+'/'));result+=found||folder?`<a href="#file=${encodeURIComponent((found||folder).path)}">${esc(link[1])}</a>`:esc(link[1]);}}pos=m.index+t.length;}
 return result+esc(text.slice(pos));
}
function codeBlock(text){return '<div class="code-tools"><button type="button" data-copy-block>คัดลอกโค้ด</button></div><pre><code>'+highlight(text)+'</code></pre>';}
function markdown(text,path){const lines=text.split('\n');let html='',i=0;
 while(i<lines.length){const line=lines[i];if(!line.trim()){i++;continue;}
 if(line.startsWith('```')){const block=[];i++;while(i<lines.length&&!lines[i].startsWith('```'))block.push(lines[i++]);i++;html+=codeBlock(block.join('\n'));continue;}
 const h=line.match(/^(#{1,6})\s+(.+)$/);if(h){html+=`<h${h[1].length}>${inline(h[2],path)}</h${h[1].length}>`;i++;continue;}
 if(line.startsWith('|')&&/^\|[\s:|-]+\|\s*$/.test(lines[i+1]||'')){const cells=l=>l.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());html+='<div class="table-wrap"><table><thead><tr>'+cells(line).map(c=>'<th>'+inline(c,path)+'</th>').join('')+'</tr></thead><tbody>';i+=2;while(i<lines.length&&lines[i].startsWith('|')){html+='<tr>'+cells(lines[i++]).map(c=>'<td>'+inline(c,path)+'</td>').join('')+'</tr>';}html+='</tbody></table></div>';continue;}
 if(/^\s*(?:[-*]|\d+\.)\s/.test(line)){const ordered=/^\s*\d+\./.test(line),tag=ordered?'ol':'ul',pattern=ordered?/^\s*\d+\.\s+/:/^\s*[-*]\s+/;html+='<'+tag+'>';while(i<lines.length&&pattern.test(lines[i]))html+='<li>'+inline(lines[i++].replace(pattern,''),path)+'</li>';html+='</'+tag+'>';continue;}
 if(line.startsWith('> ')){html+='<blockquote>'+inline(line.slice(2),path)+'</blockquote>';i++;continue;}
 html+='<p>'+inline(line,path)+'</p>';i++;
 }return html;}
function notice(text){$('notice').textContent=text;}
const sections=[
 {id:'start',title:'01 เริ่มใช้งาน',hint:'ตั้งค่า / อ่านสเปก / ปรับโครง'},
 {id:'tasks',title:'02 งานปฏิบัติ 6 แบบ',hint:'คำถาม + วิธีทำ + เฉลย'},
 {id:'topics',title:'03 เนื้อหาอ้างอิง',hint:'ทฤษฎี / DTO / Pagination / Error'},
 {id:'postman',title:'04 Postman และ Requests',hint:'เชื่อม API / ส่ง request'},
 {id:'debug',title:'05 Debug และก่อนส่ง',hint:'แก้ปัญหา / ใช้งาน offline'},
 {id:'source',title:'06 Source code',hint:'ไฟล์จริง แยกตาม Layer'}
];
const titles={
 'README.md':'ภาพรวมชุดเอกสาร','START-HERE.th.md':'เริ่มรัน API ในเครื่อง','GUIDE.md':'วิธีปรับ Template ทีละขั้น','POSTMAN.md':'เชื่อมและทดสอบด้วย Postman','QUESTIONS-AND-ANSWERS.md':'รวมคำถามและเฉลย',
 'guides/01-contract.md':'จดสเปกและ API Contract','guides/05-template.md':'นำโค้ดใส่ Template อาจารย์','guides/02-crud.md':'หลักการ CRUD','guides/03-pagination-dto.md':'Pagination และ DTO','guides/04-errors-keys.md':'Error และชนิด Key','guides/06-offline.md':'แก้ Error / Offline / ก่อนส่ง',
 'guides/operations/01-create-product.md':'C1 · เพิ่มข้อมูลสินค้า','guides/operations/02-read-brands.md':'R1 · อ่านรายการแบรนด์','guides/operations/03-read-products.md':'R2 · รายการ + Pagination','guides/operations/04-read-product-detail.md':'R3 · อ่านรายละเอียดสินค้า','guides/operations/05-update-product.md':'U1 · แก้ไขสินค้า','guides/operations/06-delete-product.md':'D1 · ลบสินค้า',
 'requests/catalog.http':'ตัวอย่าง Request (.http)','requests/postman.json':'Postman Collection (.json)','requests/curl.sh':'ตรวจ API ด้วย curl',
 'INT161-MIDTERM/01-http-rest-status.md':'HTTP / REST / Status','INT161-MIDTERM/02-express-esm.md':'Express / ESM','INT161-MIDTERM/03-controller-service-repository.md':'Controller / Service / Repository','INT161-MIDTERM/04-crud-sql.md':'CRUD / SQL','INT161-MIDTERM/05-dto-mapper.md':'DTO / Mapper','INT161-MIDTERM/06-pagination.md':'Pagination','INT161-MIDTERM/07-exception-handling.md':'Exception Handling','INT161-MIDTERM/08-complete-code-example.md':'ตัวอย่างโค้ดครบ','INT161-MIDTERM/09-common-errors.md':'Error ที่พบบ่อย'
};
function sectionFor(path){
 if(['README.md','START-HERE.th.md','GUIDE.md','guides/01-contract.md','guides/05-template.md'].includes(path))return 'start';
 if(path==='QUESTIONS-AND-ANSWERS.md'||path.startsWith('guides/operations/'))return 'tasks';
 if(path.startsWith('INT161-MIDTERM/')||['guides/02-crud.md','guides/03-pagination-dto.md','guides/04-errors-keys.md'].includes(path))return 'topics';
 if(path==='POSTMAN.md'||path.startsWith('requests/'))return 'postman';
 if(path==='guides/06-offline.md')return 'debug';return 'source';
}
function titleFor(path){return titles[path]||path.split('/').pop();}
function sourceLayer(path){
 const layers=[['controllers-','Controller · รับ/ตอบ HTTP'],['services-','Service · กฎและ Validation'],['repositories-','Repository · SQL'],['mappers-','Mapper · DTO / Response'],['middlewares-','Middleware · Pagination / Error'],['configs-','Config · DB / Identity']];
 for(const [part,title] of layers)if(path.includes('/'+part))return title;
 if(path.startsWith('recipes/'))return 'Recipes · โค้ดทางเลือก';if(path.startsWith('sql/'))return 'Database · Schema';return 'App / Package / Environment';
}
const openSections=new Set(['start','tasks']);
function fileLink(file){const a=document.createElement('a');a.href='#file='+encodeURIComponent(file.path);a.title=file.path;a.textContent=titleFor(file.path);if(file.path===currentPath)a.setAttribute('aria-current','page');return a;}
function listFiles(){
 const q=$('search').value.trim().toLowerCase(),files=library.filter(f=>(titleFor(f.path)+'\n'+f.path+'\n'+f.content).toLowerCase().includes(q));$('files').replaceChildren();
 for(const section of sections){const matches=files.filter(f=>sectionFor(f.path)===section.id);if(!matches.length)continue;
  const detail=document.createElement('details');detail.className='nav-group';detail.open=!!q||openSections.has(section.id)||matches.some(f=>f.path===currentPath);
  const summary=document.createElement('summary');summary.textContent=section.title;const count=document.createElement('span');count.textContent=matches.length;summary.append(count);detail.append(summary);
  detail.addEventListener('toggle',()=>{if(!q){if(detail.open)openSections.add(section.id);else openSections.delete(section.id);}});
  if(section.id==='source'){
   const groups=[...new Set(matches.map(f=>sourceLayer(f.path)))];for(const layer of groups){const group=document.createElement('details');group.className='source-group';const subset=matches.filter(f=>sourceLayer(f.path)===layer);group.open=!!q||subset.some(f=>f.path===currentPath);const label=document.createElement('summary');label.textContent=layer;group.append(label);subset.forEach(f=>group.append(fileLink(f)));detail.append(group);}
  }else matches.forEach(f=>detail.append(fileLink(f)));
  $('files').append(detail);
 }
 if(!files.length){const p=document.createElement('p');p.className='muted';p.textContent='ไม่พบคำค้น ลองชื่อเรื่องหรือ error code';$('files').append(p);}
 $('count').textContent=q?`พบ ${files.length} จาก ${library.length} ไฟล์`:`6 หมวด · ${library.length} ไฟล์`;
}
function renderRelated(path){
 const operation=path.match(/(?:guides\/operations\/|src\/controllers-\$id\/)([^/]+)\.(?:md|js)$/);
 const links=[];
 if(operation){const stem=operation[1];links.push(['คู่มือ + เฉลย','guides/operations/'+stem+'.md'],['Controller','src/controllers-$id/'+stem+'.js'],['Service','src/services-$id/catalog-service.js'],['Repository','src/repositories-$id/catalog-repository.js'],['Mapper','src/mappers-$id/product-mapper.js'],['Postman','POSTMAN.md']);}
 else if(path==='POSTMAN.md'||path.startsWith('requests/'))links.push(['วิธีใช้ Postman','POSTMAN.md'],['Collection','requests/postman.json'],['Request .http','requests/catalog.http'],['เริ่มเปิด API','START-HERE.th.md']);
 else if(sectionFor(path)==='source')links.push(['วิธีปรับ Template','GUIDE.md'],['API Contract','guides/01-contract.md'],['ตรวจด้วย Postman','POSTMAN.md']);
 $('related').replaceChildren();for(const [label,target] of links){if(target===path)continue;const a=document.createElement('a');a.href='#file='+encodeURIComponent(target);a.textContent=label;$('related').append(a);}
 $('related').hidden=!$('related').childElementCount;
}
function buildToc(){const headings=[...$('document').querySelectorAll('h2,h3')];$('toc').replaceChildren();$('toc').hidden=headings.length<2;if(headings.length<2)return;const label=document.createElement('strong');label.textContent='ในหน้านี้';$('toc').append(label);headings.forEach((h,i)=>{h.id='part-'+i;const b=document.createElement('button');b.type='button';b.textContent=h.textContent;b.className=h.tagName==='H3'?'subheading':'';b.addEventListener('click',()=>h.scrollIntoView({block:'start'}));$('toc').append(b);});}
function navigate(){let path='';try{path=location.hash.startsWith('#file=')?decodeURIComponent(location.hash.slice(6)):'';}catch{}const file=library.find(f=>f.path===path);currentPath=file?.path||'';$('home').hidden=!!file;$('reader').hidden=!file;notice(path&&!file?'ไม่พบไฟล์นี้ในคลัง':'');if(file){$('filename').textContent=titleFor(file.path);$('filepath').textContent=file.path;$('breadcrumb').textContent='หน้ารวมงาน / '+sections.find(s=>s.id===sectionFor(file.path)).title;$('kind').textContent=file.path.endsWith('.md')?'คู่มือและวิธีทำ':'SOURCE CODE · คัดลอกไปปรับ';$('document').innerHTML=file.path.endsWith('.md')?markdown(file.content,file.path):codeBlock(file.content);$('download').href='/download?file='+encodeURIComponent(file.path);$('download').download=file.path.split('/').pop();renderRelated(file.path);buildToc();}listFiles();window.scrollTo(0,0);}
document.addEventListener('click',async e=>{const open=e.target.closest('[data-open]');if(open){location.hash='file='+encodeURIComponent(open.dataset.open);return;}const copy=e.target.closest('[data-copy-block]');if(copy){try{await navigator.clipboard.writeText(copy.parentElement.nextElementSibling.textContent);notice('คัดลอกโค้ดแล้ว');}catch{notice('เลือกโค้ดแล้วคัดลอกด้วยตนเองได้');}}});
$('copy-file').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(library.find(f=>f.path===currentPath).content);notice('คัดลอกทั้งไฟล์แล้ว');}catch{notice('เลือกข้อความแล้วคัดลอก หรือดาวน์โหลดไฟล์ได้');}});
$('search').addEventListener('input',listFiles);window.addEventListener('hashchange',navigate);
fetch('/api/library').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(files=>{library=files;navigate();}).catch(()=>notice('โหลดไฟล์ไม่สำเร็จ ตรวจว่า npm run study ยังทำงานอยู่แล้ว reload'));
