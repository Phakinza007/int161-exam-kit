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
function listFiles(){const q=$('search').value.trim().toLowerCase(),files=library.filter(f=>(f.path+'\n'+f.content).toLowerCase().includes(q));$('files').replaceChildren();for(const f of files){const a=document.createElement('a');a.href='#file='+encodeURIComponent(f.path);a.textContent=f.path;if(f.path===currentPath)a.setAttribute('aria-current','page');$('files').append(a);}$('count').textContent=`${files.length} / ${library.length} ไฟล์`;}
function navigate(){let path='';try{path=location.hash.startsWith('#file=')?decodeURIComponent(location.hash.slice(6)):'';}catch{}const file=library.find(f=>f.path===path);currentPath=file?.path||'';$('home').hidden=!!file;$('reader').hidden=!file;notice(path&&!file?'ไม่พบไฟล์นี้ในคลัง':'');if(file){$('filename').textContent=file.path;$('kind').textContent=file.path.endsWith('.md')?'GUIDE / DOCUMENT':'SOURCE / COPY & ADAPT';$('document').innerHTML=file.path.endsWith('.md')?markdown(file.content,file.path):codeBlock(file.content);$('download').href='/download?file='+encodeURIComponent(file.path);$('download').download=file.path.split('/').pop();}listFiles();window.scrollTo(0,0);}
document.addEventListener('click',async e=>{const open=e.target.closest('[data-open]');if(open){location.hash='file='+encodeURIComponent(open.dataset.open);return;}const copy=e.target.closest('[data-copy-block]');if(copy){try{await navigator.clipboard.writeText(copy.parentElement.nextElementSibling.textContent);notice('คัดลอกโค้ดแล้ว');}catch{notice('เลือกโค้ดแล้วคัดลอกด้วยตนเองได้');}}});
$('copy-file').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(library.find(f=>f.path===currentPath).content);notice('คัดลอกทั้งไฟล์แล้ว');}catch{notice('เลือกข้อความแล้วคัดลอก หรือดาวน์โหลดไฟล์ได้');}});
$('search').addEventListener('input',listFiles);window.addEventListener('hashchange',navigate);
fetch('/api/library').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(files=>{library=files;navigate();}).catch(()=>notice('โหลดไฟล์ไม่สำเร็จ ตรวจว่า npm run study ยังทำงานอยู่แล้ว reload'));
