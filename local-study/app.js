'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function languageFor(path){const ext=path.split('.').pop();return ({js:'javascript',json:'json',sql:'sql',sh:'bash',http:'http',example:'dotenv'})[ext]||'text';}
function highlight(text,language='javascript'){
 const lang=({js:'javascript',sh:'bash',shell:'bash',dotenv:'dotenv'})[language]||language;
 if(['text','plaintext',''].includes(lang))return esc(text);
 const shell=lang==='bash',js=lang==='javascript',sql=lang==='sql',json=lang==='json';
 const keywords=new Set((shell?'git clone cd npm ci cp node curl mysql start run install export':sql?'SELECT FROM WHERE JOIN LEFT INNER ON AS INSERT INTO VALUES UPDATE SET DELETE ORDER BY ASC DESC LIMIT OFFSET COUNT CREATE TABLE PRIMARY KEY NOT NULL UNIQUE GROUP HAVING AND OR':lang==='http'?'GET POST PUT PATCH DELETE Content Type Authorization':lang==='dotenv'?'': 'import from export default const let var function async await return if else throw new class extends super try catch finally for of in while null undefined true false').split(' '));
 const pattern=/(https?:\/\/[^\s"'`]+|\/\*[\s\S]*?\*\/|\/\/[^\n]*|--[^\n]*|#[^\n]*|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g;
 let out='',last=0;
 for(const m of text.matchAll(pattern)){out+=esc(text.slice(last,m.index));const t=m[0],after=text.slice(m.index+t.length);
  let cls=/^https?:/.test(t)?'url':((js&&(t.startsWith('//')||t.startsWith('/*')))||(sql&&t.startsWith('--'))||((shell||lang==='dotenv')&&t.startsWith('#')))?'comment':/^["'`]/.test(t)?(json&&/^\s*:/.test(after)?'property':'string'):/^\d/.test(t)?'number':keywords.has(t)?'keyword':shell&&t.startsWith('--')?'property':js&&/^\s*\(/.test(after)?'function':(js&&/^\s*:/.test(after))||(lang==='dotenv'&&/^=/.test(after))?'property':'';
  out+=cls?`<span class="tok-${cls}">${esc(t)}</span>`:esc(t);last=m.index+t.length;
 }return out+esc(text.slice(last));
}
let library=[],currentPath='';
function resolveLink(target,from){const url=new URL(target,'http://local/'+from);return {path:decodeURIComponent(url.pathname.slice(1)),hash:url.hash};}
function inline(text,path){
 const rx=/(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;let result='',pos=0;
 for(const m of text.matchAll(rx)){result+=esc(text.slice(pos,m.index));const t=m[0];if(t[0]==='`')result+='<code>'+esc(t.slice(1,-1))+'</code>';else if(t.startsWith('**'))result+='<strong>'+esc(t.slice(2,-2))+'</strong>';else{const link=t.match(/^\[([^\]]+)\]\(([^)]+)\)$/);const target=link[2];if(/^https?:\/\//.test(target))result+=`<a href="${esc(target)}" target="_blank" rel="noreferrer">${esc(link[1])} ↗</a>`;else{const r=resolveLink(target,path);const found=library.find(f=>f.path===r.path);const folder=library.find(f=>f.path.startsWith(r.path.replace(/\/$/,'')+'/'));result+=found||folder?`<a href="#file=${encodeURIComponent((found||folder).path)}">${esc(link[1])}</a>`:esc(link[1]);}}pos=m.index+t.length;}
 return result+esc(text.slice(pos));
}
function codeBlock(text,language='text'){return '<div class="code-tools"><span class="code-language">'+esc(language.toUpperCase())+'</span><button type="button" data-copy-block>คัดลอกโค้ด</button></div><pre><code>'+highlight(text,language)+'</code></pre>';}
function markdown(text,path){const lines=text.split('\n');let html='',i=0;
 while(i<lines.length){const line=lines[i];if(!line.trim()){i++;continue;}
 if(line.startsWith('```')){const language=line.slice(3).trim()||'text';const block=[];i++;while(i<lines.length&&!lines[i].startsWith('```'))block.push(lines[i++]);i++;html+=codeBlock(block.join('\n'),language);continue;}
 const h=line.match(/^(#{1,6})\s+(.+)$/);if(h){html+=`<h${h[1].length}>${inline(h[2],path)}</h${h[1].length}>`;i++;continue;}
 if(line.startsWith('|')&&/^\|[\s:|-]+\|\s*$/.test(lines[i+1]||'')){const cells=l=>l.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());html+='<div class="table-wrap"><table><thead><tr>'+cells(line).map(c=>'<th>'+inline(c,path)+'</th>').join('')+'</tr></thead><tbody>';i+=2;while(i<lines.length&&lines[i].startsWith('|')){html+='<tr>'+cells(lines[i++]).map(c=>'<td>'+inline(c,path)+'</td>').join('')+'</tr>';}html+='</tbody></table></div>';continue;}
 if(/^\s*(?:[-*]|\d+\.)\s/.test(line)){const ordered=/^\s*\d+\./.test(line),tag=ordered?'ol':'ul',pattern=ordered?/^\s*\d+\.\s+/:/^\s*[-*]\s+/;html+='<'+tag+'>';while(i<lines.length&&pattern.test(lines[i]))html+='<li>'+inline(lines[i++].replace(pattern,''),path)+'</li>';html+='</'+tag+'>';continue;}
 if(line.startsWith('> ')){html+='<blockquote>'+inline(line.slice(2),path)+'</blockquote>';i++;continue;}
 html+='<p>'+inline(line,path)+'</p>';i++;
 }return html;}
const learningChapters=[
 {path:'START-HERE.th.md',title:'เริ่มตรงนี้',time:'10 นาที'},
 {path:'guides/walkthrough/01-webstorm.md',title:'เปิด Template ใน WebStorm',time:'20 นาที'},
 {path:'guides/walkthrough/02-database.md',title:'ต่อ MySQL และดู Schema',time:'30 นาที'},
 {path:'guides/walkthrough/03-crud.md',title:'ไล่ CRUD ทีละไฟล์',time:'45 นาที'},
 {path:'guides/walkthrough/04-contracts.md',title:'DTO / Pagination / Error',time:'30 นาที'},
 {path:'guides/walkthrough/05-postman-offline.md',title:'Postman และ Offline',time:'30 นาที'}
];
const progressKey='int161-walkthrough-v1';
function loadProgress(){try{const value=JSON.parse(localStorage.getItem(progressKey)||'[]');return new Set(Array.isArray(value)?value.filter(p=>learningChapters.some(c=>c.path===p)):[]);}catch{return new Set();}}
let completedChapters=loadProgress();
function saveProgress(){try{localStorage.setItem(progressKey,JSON.stringify([...completedChapters]));}catch{notice('บันทึกในเบราว์เซอร์ไม่ได้ แต่ยังอ่านคู่มือต่อได้');}}
function renderLearning(){
 $('lesson-count').textContent=`ตรวจแล้ว ${completedChapters.size} / ${learningChapters.length} บท`;
 $('lesson-links').replaceChildren();
 learningChapters.forEach((chapter,i)=>{const a=document.createElement('a');a.href='#file='+encodeURIComponent(chapter.path);a.className='lesson-card'+(completedChapters.has(chapter.path)?' complete':'');const number=document.createElement('span');number.className='lesson-number';number.textContent=String(i).padStart(2,'0');const title=document.createElement('strong');title.textContent=chapter.title;const meta=document.createElement('small');meta.textContent=completedChapters.has(chapter.path)?'✓ ตรวจแล้ว':`ประมาณ ${chapter.time}`;a.append(number,title,meta);$('lesson-links').append(a);});
 const index=learningChapters.findIndex(c=>c.path===currentPath);$('chapter-tools').hidden=index<0;if(index<0)return;
 $('chapter-position').textContent=`บท ${String(index).padStart(2,'0')} · ลำดับ ${index+1}/${learningChapters.length} · ${learningChapters[index].title}`;
 $('chapter-done').checked=completedChapters.has(currentPath);
 const previous=$('chapter-prev'),next=$('chapter-next');previous.hidden=index===0;next.hidden=index===learningChapters.length-1;
 if(index>0){previous.href='#file='+encodeURIComponent(learningChapters[index-1].path);previous.textContent='← '+learningChapters[index-1].title;}
 if(index<learningChapters.length-1){next.href='#file='+encodeURIComponent(learningChapters[index+1].path);next.textContent=learningChapters[index+1].title+' →';}
}

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
 'README.md':'ภาพรวมชุดเอกสาร','START-HERE.th.md':'00 · เริ่มตรงนี้','GUIDE.md':'วิธีปรับ Template ทีละขั้น','POSTMAN.md':'เชื่อมและทดสอบด้วย Postman','QUESTIONS-AND-ANSWERS.md':'รวมคำถามและเฉลย',
 'guides/00-template-map.md':'แผนที่ไฟล์ ZIP อาจารย์','guides/01-contract.md':'จดสเปกและ API Contract','guides/05-template.md':'นำโค้ดใส่ Template อาจารย์','guides/02-crud.md':'หลักการ CRUD','guides/03-pagination-dto.md':'Pagination และ DTO','guides/04-errors-keys.md':'Error และชนิด Key','guides/06-offline.md':'แก้ Error / Offline / ก่อนส่ง',
 'guides/operations/01-create-product.md':'C1 · เพิ่มข้อมูลสินค้า','guides/operations/02-read-brands.md':'R1 · อ่านรายการแบรนด์','guides/operations/03-read-products.md':'R2 · รายการ + Pagination','guides/operations/04-read-product-detail.md':'R3 · อ่านรายละเอียดสินค้า','guides/operations/05-update-product.md':'U1 · แก้ไขสินค้า','guides/operations/06-delete-product.md':'D1 · ลบสินค้า',
 'requests/catalog.http':'ตัวอย่าง Request (.http)','requests/postman.json':'Postman Collection (.json)','requests/curl.sh':'ตรวจ API ด้วย curl',
 'INT161-MIDTERM/01-http-rest-status.md':'HTTP / REST / Status','INT161-MIDTERM/02-express-esm.md':'Express / ESM','INT161-MIDTERM/03-controller-service-repository.md':'Route / Service / Repository','INT161-MIDTERM/04-crud-sql.md':'CRUD / SQL','INT161-MIDTERM/05-dto-mapper.md':'DTO / Mapper','INT161-MIDTERM/06-pagination.md':'Pagination','INT161-MIDTERM/07-exception-handling.md':'Exception Handling','INT161-MIDTERM/08-complete-code-example.md':'ตัวอย่างโค้ดครบ','INT161-MIDTERM/09-common-errors.md':'Error ที่พบบ่อย'
};
function sectionFor(path){
 if(path.startsWith('guides/walkthrough/')||['README.md','START-HERE.th.md','GUIDE.md','guides/00-template-map.md','guides/01-contract.md','guides/05-template.md'].includes(path))return 'start';
 if(path==='QUESTIONS-AND-ANSWERS.md'||path.startsWith('guides/operations/'))return 'tasks';
 if(path.startsWith('INT161-MIDTERM/')||['guides/02-crud.md','guides/03-pagination-dto.md','guides/04-errors-keys.md'].includes(path))return 'topics';
 if(path==='POSTMAN.md'||path.startsWith('requests/'))return 'postman';
 if(path==='guides/06-offline.md')return 'debug';return 'source';
}
function titleFor(path){const chapter=learningChapters.findIndex(c=>c.path===path);return chapter>=0?String(chapter).padStart(2,'0')+' · '+learningChapters[chapter].title:titles[path]||path.split('/').pop();}
function sourceLayer(path){
 const layers=[['routes-','Route · รับ req / ส่ง res'],['services-','Service · กฎและ Validation'],['repositories-','Repository · SQL'],['mappers-','Mapper · DTO / Response'],['middlewares-','Middleware · Pagination / Error'],['configs-','Config · DB / Identity']];
 for(const [part,title] of layers)if(path.includes('/'+part))return title;
 if(path.startsWith('recipes/'))return 'Recipes · โค้ดทางเลือก';if(path.startsWith('sql/'))return 'Database · Schema';return 'App / Package / Environment';
}
const openSections=new Set(['start','tasks']);
const teacherFiles=new Set(['src/app.js','src/test-service.js','src/configs-$id/db-config.js','src/routes-$id/route.js','src/services-$id/service.js','src/repositories-$id/repository.js','src/mappers-$id/api-response.js','src/mappers-$id/entity-dto-mapper.js','src/middlewares-$id/pagination-middleware.js']);
function fileLink(file){const a=document.createElement('a');a.href='#file='+encodeURIComponent(file.path);a.title=file.path;a.textContent=titleFor(file.path);if(file.path.startsWith('src/')){const small=document.createElement('small');small.className='file-origin';small.textContent=teacherFiles.has(file.path)?'ตาม ZIP':'เพิ่มเติม';a.append(small);}if(file.path===currentPath)a.setAttribute('aria-current','page');return a;}
function listFiles(){
 const q=$('search').value.trim().toLowerCase(),files=library.filter(f=>(titleFor(f.path)+'\n'+f.path+'\n'+f.content).toLowerCase().includes(q));$('files').replaceChildren();
 for(const section of sections){const matches=files.filter(f=>sectionFor(f.path)===section.id);if(section.id==='start')matches.sort((a,b)=>{const ai=learningChapters.findIndex(c=>c.path===a.path),bi=learningChapters.findIndex(c=>c.path===b.path);return (ai<0?99:ai)-(bi<0?99:bi);});if(!matches.length)continue;
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
 const operation=path.match(/guides\/operations\/([^/]+)\.md$/);
 const links=[];
 if(operation){const stem=operation[1];links.push(['คู่มือ + เฉลย','guides/operations/'+stem+'.md'],['Route / req-res','src/routes-$id/route.js'],['Service','src/services-$id/service.js'],['Repository','src/repositories-$id/repository.js'],['Mapper','src/mappers-$id/entity-dto-mapper.js'],['Postman','POSTMAN.md']);}
 else if(path==='POSTMAN.md'||path.startsWith('requests/'))links.push(['วิธีใช้ Postman','POSTMAN.md'],['Collection','requests/postman.json'],['Request .http','requests/catalog.http'],['เริ่มเปิด API','START-HERE.th.md']);
 else if(sectionFor(path)==='source')links.push(['วิธีปรับ Template','GUIDE.md'],['API Contract','guides/01-contract.md'],['ตรวจด้วย Postman','POSTMAN.md']);
 $('related').replaceChildren();for(const [label,target] of links){if(target===path)continue;const a=document.createElement('a');a.href='#file='+encodeURIComponent(target);a.textContent=label;$('related').append(a);}
 $('related').hidden=!$('related').childElementCount;
}
const diagramNodes={
 client:['Postman / Client','ส่ง Method, URL และ JSON','POSTMAN.md'],route:['route.js / HTTP','จับคู่ URL, อ่าน req และส่ง res','src/routes-$id/route.js'],service:['Service','ตรวจเงื่อนไขและประสานงาน','src/services-$id/service.js'],repo:['Repository','SQL + bind parameters','src/repositories-$id/repository.js'],db:['MySQL','เก็บแถวข้อมูล / constraint','sql/schema.sql'],mapper:['Mapper / DTO','เลือก field และแปลงชนิดข้อมูล','src/mappers-$id/entity-dto-mapper.js'],response:['HTTP Response','JSON + Status ตาม contract','src/mappers-$id/api-response.js'],error:['Error Handler','แปลง error เป็น status + JSON','src/middlewares-$id/error-handler.js'],pagination:['Pagination','ตรวจ page/limit แล้วหา offset','src/middlewares-$id/pagination-middleware.js'],count:['SELECT + COUNT','รายการและจำนวนทั้งหมด เงื่อนไขเดียวกัน','src/repositories-$id/repository.js'],meta:['Metadata','total / page / limit / totalPages','src/mappers-$id/api-response.js'],env:['.env / Config','Host, DB, Port และ identity','src/configs-$id/settings.js'],node:['Node + Express','npm start เปิด API port 3000','src/app.js'],desk:['Study Desk','npm run study เปิดคู่มือ port 8171','GUIDE.md'],entity:['Entity','แถวจาก DB อาจมีชื่อ/ชนิดต่างจาก API','src/repositories-$id/repository.js']
};
const diagramScenes={
 overview:{label:'ภาพรวม',title:'หนึ่ง Request ผ่านใครบ้าง?',rows:[['เรียกงาน',['client','route','service','repo','db']],['คืนข้อมูลและแปลง DTO',['db','repo','service','mapper','service','route','response']]],note:'Service เรียก Mapper หลังได้ Entity แล้วคืน DTO ให้ route.js เส้นทางผิดพลาดจะไป Error Handler แทน success response'},
 setup:{label:'เปิดโปรเจกต์',title:'เปิดคู่มือกับเปิด API เป็นคนละ Terminal',rows:[['หน้าอ่านข้อมูล',['desk']],['API เชื่อมฐานข้อมูล',['env','node','db']],['ทดสอบ API',['client','node','response']]],note:'เปิดคู่มือที่ http://127.0.0.1:8171 ส่วน Postman ส่ง request ไป http://127.0.0.1:3000/api/demo001 ตาม PORT/STUDENT_ID จริง ไม่ต่อไป port 3306 ของ MySQL'},
 pagination:{label:'Pagination',title:'จาก Query ไปเป็นข้อมูลหนึ่งหน้า',rows:[['รับและอ่านข้อมูล',['client','route','pagination','service','count']],['แปลงและส่งกลับ',['service','mapper','service','route','meta','response']]],note:'offset=(page−1)×limit; SELECT และ COUNT ต้องใช้ filter เดียวกัน Service เรียก mapper.maps(items, summary) แล้ว route.js เรียก apiResponse(res, data, pagination) เพื่อประกอบ metadata'},
 dto:{label:'DTO',title:'Entity → DTO → JSON',rows:[['อ่านจากฐาน',['repo','entity']],['แปลงใน Service',['service','mapper','service','route','response']]],note:'Repository คืน Entity ให้ Service แล้ว Service เรียก Mapper ตัวอย่าง brand_id → brandId, price string → number ไม่ส่ง internal_cost ออกไป'},
 error:{label:'Error',title:'เมื่อทำงานต่อในเส้นทางสำเร็จไม่ได้',rows:[['ตรวจพบปัญหา',['service','error','response']],['SQL reject',['db','repo','error','response']]],note:'Service throw AppError หรือ DB reject แล้ว Express 5 ส่ง rejected Promise ไป Error Handler; โครงนี้ใช้ 400 validation/FK, 404 not found, 409 duplicate/in use, 500 unexpected และไม่ส่ง SQL/stack ให้ client'},
 postman:{label:'Postman',title:'Postman คุยกับ API แล้ว API จึงคุยกับ MySQL',rows:[['HTTP request',['client','node','route','service','repo','db']],['HTTP response',['route','response','client']]],note:'เลือก Method + URL → ตั้ง Body raw JSON สำหรับ POST/PUT → Send → ตรวจ HTTP status และ body การคืนค่าระหว่าง DB/Repository/Service ดูแท็บภาพรวม ไม่ใส่รหัสผ่าน MySQL ใน request URL'}
};
function diagramFor(path){if(path==='START-HERE.th.md')return 'setup';if(path==='POSTMAN.md'||path.startsWith('requests/'))return 'postman';if(/pagination|03-read-products/.test(path))return 'pagination';if(/dto|mapper/.test(path))return 'dto';if(/error|exception|offline/.test(path))return 'error';return 'overview';}
function diagramMarkup(kind,path){const scene=diagramScenes[kind]||diagramScenes.overview;
 const rowHtml=scene.rows.map(([label,keys])=>'<div class="diagram-row"><p class="diagram-row-label">'+esc(label)+'</p><div class="diagram-track">'+keys.map((key,i)=>{const node=diagramNodes[key];let target=node[2];const active=target===path?' current-node':'';return (i?'<span class="diagram-arrow" aria-hidden="true">→</span>':'')+'<a class="diagram-node'+active+'" href="#file='+encodeURIComponent(target)+'"><strong>'+esc(node[0])+'</strong><span>'+esc(node[1])+'</span></a>';}).join('')+'</div></div>').join('');
 return '<h2>'+esc(scene.title)+'</h2>'+rowHtml+'<p class="diagram-explanation">'+esc(scene.note)+'</p>';
}
function renderDiagram(kind=diagramFor(currentPath)){$('diagram-content').innerHTML=diagramMarkup(kind,currentPath);document.querySelectorAll('[data-diagram]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.diagram===kind)));}

function buildToc(){const headings=[...$('document').querySelectorAll('h2,h3')];$('toc').replaceChildren();$('toc').hidden=headings.length<2;if(headings.length<2)return;const label=document.createElement('strong');label.textContent='ในหน้านี้';$('toc').append(label);headings.forEach((h,i)=>{h.id='part-'+i;const b=document.createElement('button');b.type='button';b.textContent=h.textContent;b.className=h.tagName==='H3'?'subheading':'';b.addEventListener('click',()=>h.scrollIntoView({block:'start'}));$('toc').append(b);});}
function navigate(){let path='';try{path=location.hash.startsWith('#file=')?decodeURIComponent(location.hash.slice(6)):'';}catch{}const file=library.find(f=>f.path===path);currentPath=file?.path||'';$('home').hidden=!!file;$('reader').hidden=!file;notice(path&&!file?'ไม่พบไฟล์นี้ในคลัง':'');if(file){$('filename').textContent=titleFor(file.path);$('filepath').textContent=file.path;$('breadcrumb').textContent='หน้ารวมงาน / '+sections.find(s=>s.id===sectionFor(file.path)).title;$('kind').textContent=file.path.endsWith('.md')?'คู่มือและวิธีทำ':(teacherFiles.has(file.path)?'SOURCE CODE · ตามโครง ZIP อาจารย์':'SOURCE CODE · ส่วนที่เพิ่ม');$('document').innerHTML=file.path.endsWith('.md')?markdown(file.content,file.path):codeBlock(file.content,languageFor(file.path));$('download').href='/download?file='+encodeURIComponent(file.path);$('download').download=file.path.split('/').pop();const chapter=learningChapters.some(c=>c.path===file.path);$('reader').classList.toggle('walkthrough-reading',chapter);document.querySelector('.visual-panel').open=!chapter||/03-crud|04-contracts/.test(file.path);renderRelated(file.path);renderDiagram();buildToc();}renderLearning();listFiles();window.scrollTo(0,0);}
document.addEventListener('click',async e=>{const diagram=e.target.closest('[data-diagram]');if(diagram){renderDiagram(diagram.dataset.diagram);return;}const open=e.target.closest('[data-open]');if(open){location.hash='file='+encodeURIComponent(open.dataset.open);return;}const copy=e.target.closest('[data-copy-block]');if(copy){try{await navigator.clipboard.writeText(copy.parentElement.nextElementSibling.textContent);notice('คัดลอกโค้ดแล้ว');}catch{notice('เลือกโค้ดแล้วคัดลอกด้วยตนเองได้');}}});
$('copy-file').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(library.find(f=>f.path===currentPath).content);notice('คัดลอกทั้งไฟล์แล้ว');}catch{notice('เลือกข้อความแล้วคัดลอก หรือดาวน์โหลดไฟล์ได้');}});
$('chapter-done').addEventListener('change',()=>{if($('chapter-done').checked)completedChapters.add(currentPath);else completedChapters.delete(currentPath);saveProgress();renderLearning();});
$('reset-lessons').addEventListener('click',()=>{completedChapters.clear();saveProgress();renderLearning();notice('เริ่ม self-check ใหม่แล้ว');});
$('search').addEventListener('input',listFiles);window.addEventListener('hashchange',navigate);
fetch('/api/library').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(files=>{library=files;navigate();}).catch(()=>notice('โหลดไฟล์ไม่สำเร็จ ตรวจว่า npm run study ยังทำงานอยู่แล้ว reload'));
