import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {loadSettings} from './configs-$id/settings.js';
import {createDb} from './configs-$id/db-config.js';
import {assertAppDatabase} from './configs-$id/database-mode.js';
// ADAPT: base path คงที่ตามรหัสใน .env; เปลี่ยน resource/router เมื่อโจทย์ใช้ตารางอื่น
import express from 'express';
import {createRepository} from './repositories-$id/repository.js';
import {createService} from './services-$id/service.js';
import {createRouter} from './routes-$id/route.js';
import {errorHandler} from './middlewares-$id/error-handler.js';
import {AppError} from './middlewares-$id/app-error.js';
export function createApp({db,studentId,name,key}) {
 if(!/^[A-Za-z0-9_-]{1,32}$/.test(studentId))throw new Error('Invalid static student ID');
 const app=express();app.disable('x-powered-by');app.use(express.json());
 const repo=createRepository(db),service=createService(repo);
 app.use(`/api/${studentId}`,createRouter(service,{studentId,name,key}));
 app.use((req,res,next)=>next(new AppError('Endpoint not found',404,'ENDPOINT_NOT_FOUND')));
 app.use(errorHandler);
 return app;
}

// npm start runs app.js; import for tests does not open a port.
if(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
const config=loadSettings(),db=createDb(config);
try {
 await assertAppDatabase(db,config);
 const server=createApp({db,...config}).listen(config.appPort,'127.0.0.1',()=>console.log(`Template API: http://127.0.0.1:${config.appPort}/api/${config.studentId}`));
 server.on('error',async err=>{console.error('Start failed:',err.code||'SERVER_ERROR');await db.end();process.exitCode=1;});
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(async()=>{await db.end();process.exit();}));
} catch(err){console.error('Start failed:',err.code||err.message);await db.end();process.exitCode=1;}

}
