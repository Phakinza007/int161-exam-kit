import {createServer} from 'node:http';
import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {join,relative,resolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const folders=['guides','INT161-MIDTERM','recipes','src','requests','sql'];
export async function getLibrary(){
 const paths=['README.md','START-HERE.th.md','GUIDE.md','POSTMAN.md','QUESTIONS-AND-ANSWERS.md','package.json','.env.example'];
 async function walk(dir){for(const entry of await readdir(join(root,dir),{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await walk(path);else if(/\.(md|js|json|http|sql|sh)$/.test(path))paths.push(path);}}
 for(const dir of folders)await walk(dir);
 return Promise.all(paths.map(async path=>({path:path.replaceAll('\\','/'),content:await readFile(join(root,path),'utf8')})));
}
export function createStudyServer(){return createServer(async(req,res)=>{
 res.setHeader('Content-Security-Policy',"default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Cache-Control','no-store');
 const send=(code,type,body)=>{res.writeHead(code,{'Content-Type':type});res.end(body);};
 try{
  if(req.method!=='GET')return send(405,'text/plain; charset=utf-8','GET only');
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname==='/api/library')return send(200,'application/json; charset=utf-8',JSON.stringify(await getLibrary()));
  if(url.pathname==='/download'){
   const file=(await getLibrary()).find(f=>f.path===url.searchParams.get('file'));
   if(!file)return send(404,'text/plain','Not found');
   res.setHeader('Content-Disposition',`attachment; filename="${file.path.split('/').pop()}"`);
   return send(200,'application/octet-stream',file.content);
  }
  const assets={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/style.css':'style.css'};
  const file=assets[url.pathname];if(!file)return send(404,'text/plain','Not found');
  return send(200,file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8',await readFile(new URL(file,import.meta.url)));
 }catch{send(500,'text/plain','Unable to load local study files');}
});}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const port=Number(process.env.STUDY_PORT||8171);
 if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid STUDY_PORT');
 const server=createStudyServer();server.on('error',e=>{console.error('Study server:',e.code);process.exitCode=1;});
 server.listen(port,'127.0.0.1',()=>console.log(`INT161 Study Desk: http://127.0.0.1:${port}`));
}
