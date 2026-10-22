# โค้ดครบตามโครง Template อาจารย์

Source ที่รันจริงอยู่ใน src ตามลิงก์ด้านล่าง route.js รับ req/res เอง ไม่มี Controller แยก app.js เปิด port ส่วน settings/database-mode/app-error/error-handler เป็น helpers ที่เพิ่ม ดู [แผนที่ไฟล์](../guides/00-template-map.md) และ [GUIDE](../GUIDE.md) ก่อนปรับตามสเปกจริง

## src/app.js

[เปิดไฟล์จริง](../src/app.js)

```js
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
```

## src/configs-$id/db-config.js

[เปิดไฟล์จริง](../src/configs-$id/db-config.js)

```js
import mysql from 'mysql2/promise';
export function createDb(config) {
  return mysql.createPool({host:config.host,port:config.port,user:config.user,password:config.password,database:config.database,
    connectionLimit:5,waitForConnections:true,timezone:'Z',dateStrings:['DATE']});
}

// Default export matches the teacher's import db from db-config.js. Pool opens lazily.
import {loadSettings} from './settings.js';
export default createDb(loadSettings());
```

## src/routes-$id/route.js

[เปิดไฟล์จริง](../src/routes-$id/route.js)

```js
// ADAPT: method/path/input/status ตามโจทย์; HTTP handler อยู่ใน route.js ตาม ZIP อาจารย์
import express from 'express';
import * as service from '../services-$id/service.js';
import {numericId} from '../services-$id/service.js';
import {queryParser} from '../middlewares-$id/pagination-middleware.js';
import {apiResponse} from '../mappers-$id/api-response.js';
// Factory เป็นส่วนช่วยทดสอบ; req/res และ handlers ทั้งหมดอยู่ในไฟล์นี้
export function createRouter(implementation = service, identity = {}) {
 const router = express.Router();
 router.get('/student-info', (req,res) => apiResponse(res,{studentId:identity.studentId,name:identity.name,secretKey:identity.key}));
 // R1: รายการแบรนด์
 router.get('/brands', async(req,res) => apiResponse(res,await implementation.listBrands()));
 // R2: รายการสินค้าแบบแบ่งหน้า
 router.get('/products', queryParser(), async(req,res) => {
  const {items,total} = await implementation.getAllObjects(req.pagination);
  return apiResponse(res,{items,totalItems:total},req.pagination);
 });
 // R3: รายละเอียดสินค้า
 router.get('/products/:id', async(req,res) => {
  const object = await implementation.getObject(numericId(req.params.id));
  return apiResponse(res,object);
 });
 // C1: รับ body แล้วคืน DTO พร้อม 201
 router.post('/products', async(req,res) => {
  const object = await implementation.createObject(req.body);
  return apiResponse(res,object,null,201);
 });
 // U1: ส่งทั้ง id และ body ไป service (ไม่เรียก updateObject() เปล่า)
 router.put('/products/:id', async(req,res) => {
  const object = await implementation.updateObject(numericId(req.params.id),req.body);
  return apiResponse(res,object);
 });
 // D1: 204 ไม่มี response body
 router.delete('/products/:id', async(req,res) => {
  await implementation.removeObject(numericId(req.params.id));
  return res.status(204).end();
 });
 // ตัวอย่างเสริม: หยิบใช้เฉพาะเมื่อ schema/โจทย์ต้องการ
 router.get('/brands/:id',async(req,res)=>apiResponse(res,await implementation.getBrand(numericId(req.params.id))));
 router.delete('/brands/:id',async(req,res)=>{await implementation.removeBrand(numericId(req.params.id));res.status(204).end();});
 router.get('/tags',async(req,res)=>apiResponse(res,await implementation.listTags()));
 router.get('/tags/:code',async(req,res)=>apiResponse(res,await implementation.getTag(req.params.code)));
 router.post('/tags',async(req,res)=>apiResponse(res,await implementation.createTag(req.body),null,201));
 router.put('/tags/:code',async(req,res)=>apiResponse(res,await implementation.updateTag(req.params.code,req.body)));
 router.delete('/tags/:code',async(req,res)=>{await implementation.removeTag(req.params.code);res.status(204).end();});
 router.get('/products/:id/tags',async(req,res)=>apiResponse(res,await implementation.listProductTags(numericId(req.params.id))));
 router.post('/products/:id/tags',async(req,res)=>apiResponse(res,await implementation.createProductTag(numericId(req.params.id),req.body),null,201));
 router.delete('/products/:id/tags/:code',async(req,res)=>{await implementation.removeProductTag(numericId(req.params.id),req.params.code);res.status(204).end();});
 return router;
}
export default createRouter();
```

## src/services-$id/service.js

[เปิดไฟล์จริง](../src/services-$id/service.js)

```js
// ADAPT: แก้productInputให้ตรงbody/required/defaultsของโจทย์; ไม่ส่งreq.bodyตรงลงSQL
// ต่อไปแก้unique rule/not-found/ชื่อerror และเลือกsummary/detailให้ตรงแต่ละendpoint
import {AppError} from '../middlewares-$id/app-error.js';
import mapper from '../mappers-$id/entity-dto-mapper.js';
import * as repository from '../repositories-$id/repository.js';
const fail=message=>{throw new AppError(message);};
function text(value,name,max) {
  if(typeof value!=='string'||!value.trim()||value.trim().length>max)fail(`${name} must be non-empty text (max ${max})`);
  return value.trim();
}
export function numericId(value) {
  if(typeof value!=='string'||!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value))||Number(value)<1)fail('id must be a positive integer');
  return Number(value);
}
function integer(value,name,{nullable=false}={}) {
  if(nullable&&value==null)return null;
  if(!Number.isSafeInteger(value)||value<0||value>2147483647)fail(`${name} must be a non-negative integer`);
  return value;
}
function dateOnly(value) {
  if(value==null)return null;
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||value<'1000-01-01'||value>'9999-12-31')fail('release_date must be YYYY-MM-DD');
  const date=new Date(value+'T00:00:00Z');
  if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value)fail('release_date must be a valid calendar date');
  return value;
}
// ADAPT BODY: เปลี่ยนfield/type/nullability/maxตามschemaจริง (PUTนี้ใช้full body)
export function productInput(body) {
  if(!body||typeof body!=='object'||Array.isArray(body))fail('JSON body must be an object');
  const sku=text(body.sku,'sku',50),name=text(body.name,'name',150),category=text(body.category,'category',50);
  const brand_id=integer(body.brand_id,'brand_id');if(brand_id<1)fail('brand_id must be positive');
  const price=body.price;
  if(typeof price!=='number'||!Number.isFinite(price)||price<0||price>99999999.99||Number(price.toFixed(2))!==price)fail('price must be a number >= 0 with at most 2 decimal places');
  return {sku,name,brand_id,category,price,ram_gb:integer(body.ram_gb,'ram_gb'),storage_gb:integer(body.storage_gb,'storage_gb'),
    color:text(body.color,'color',50),stock_quantity:integer(body.stock_quantity ?? 0,'stock_quantity'),
    status:body.status===undefined?'AVAILABLE':text(body.status,'status',30),release_date:dateOnly(body.release_date)};
}
function tagCode(value){const code=text(value,'code',32);if(!/^[A-Za-z0-9_-]+$/.test(code))fail('tag code accepts letters, digits, underscore and hyphen');return code;}
const required=(value,message,code)=>{if(!value)throw new AppError(message,404,code);return value;};
export function createService(repo) {
  const getObject=async id=>required(await repo.findOne(id),'Product not found','PRODUCT_NOT_FOUND');
  const getBrand=async id=>required(await repo.findBrand(id),'Brand not found','BRAND_NOT_FOUND');
  const getTag=async code=>required(await repo.findTag(code),'Tag not found','TAG_NOT_FOUND');
  return {
    listBrands:()=>repo.listBrands(),
    getBrand,
    async removeBrand(id){await getBrand(id);if(!await repo.removeBrand(id))throw new AppError('Brand not found',404,'BRAND_NOT_FOUND');},
    async getAllObjects(pagination) {
      if (!pagination) return mapper.maps(await repo.findAll(), 'summary');
      // ADAPT READ: เพิ่มfilterต้องส่งไปทั้งlistและcountด้วย
      const [items, total] = await Promise.all([
        repo.findAll(pagination), repo.countAll()
      ]);
      return {items: mapper.maps(items, 'summary'), total};
    },
    async getObject(id){return mapper.map(await getObject(id));},
    // CREATE: ใช้insertIdเฉพาะauto increment; string PKอ่านกลับด้วยkeyที่รับมา
    async createObject(body) {
      const data = productInput(body);
      if (await repo.findBySku(data.sku)) {
        throw new AppError('SKU already exists', 409, 'DUPLICATE_KEY');
      }
      const id = await repo.create(data);
      return mapper.map(await getObject(id));
    },
    // UPDATE: ตรวจว่ามีแถวก่อน; ค่าเดิมยังสำเร็จ อย่าใช้changedRows0เป็น404
    async updateObject(id, body) {
      await getObject(id);
      const data = productInput(body);
      const other = await repo.findBySku(data.sku);
      if (other && other.id !== id) {
        throw new AppError('SKU already exists', 409, 'DUPLICATE_KEY');
      }
      await repo.update(id, data);
      return mapper.map(await getObject(id));
    },
    // DELETE: repoคืนaffectedRows; FKerrorให้middlewareกลางแปลง
    async removeObject(id) {
      await getObject(id);
      if (!await repo.remove(id)) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }
    },
    listTags:()=>repo.listTags(),
    async getTag(code){return getTag(tagCode(code));},
    async createTag(body){const data={code:tagCode(body?.code),label:text(body?.label,'label',100)};await repo.createTag(data);return getTag(data.code);},
    async updateTag(code,body){code=tagCode(code);await getTag(code);await repo.updateTag(code,text(body?.label,'label',100));return getTag(code);},
    async removeTag(code){code=tagCode(code);await getTag(code);if(!await repo.removeTag(code))throw new AppError('Tag not found',404,'TAG_NOT_FOUND');},
    async listProductTags(id){await getObject(id);return repo.listProductTags(id);},
    async createProductTag(id,body){await getObject(id);const code=tagCode(body?.tagCode);await repo.createProductTag(id,code);return {productId:id,tagCode:code};},
    async removeProductTag(id,code){await getObject(id);code=tagCode(code);if(!await repo.removeProductTag(id,code))throw new AppError('Product/tag pair not found',404,'PRODUCT_TAG_NOT_FOUND');},
  };
}

const service = createService(repository);
export const getObject = (...args) => service.getObject(...args);
export const getAllObjects = (...args) => service.getAllObjects(...args);
export const createObject = (...args) => service.createObject(...args);
export const updateObject = (...args) => service.updateObject(...args);
export const removeObject = (...args) => service.removeObject(...args);
export const listBrands = (...args) => service.listBrands(...args);
export const getBrand = (...args) => service.getBrand(...args);
export const removeBrand = (...args) => service.removeBrand(...args);
export const listTags = (...args) => service.listTags(...args);
export const getTag = (...args) => service.getTag(...args);
export const createTag = (...args) => service.createTag(...args);
export const updateTag = (...args) => service.updateTag(...args);
export const removeTag = (...args) => service.removeTag(...args);
export const listProductTags = (...args) => service.listProductTags(...args);
export const createProductTag = (...args) => service.createProductTag(...args);
export const removeProductTag = (...args) => service.removeProductTag(...args);
```

## src/repositories-$id/repository.js

[เปิดไฟล์จริง](../src/repositories-$id/repository.js)

```js
import db from '../configs-$id/db-config.js';
// ADAPT: เปลี่ยนtable/column/PK/FK/WHERE/JOINตรงschemaโจทย์; bindค่าด้วย? เสมอ
// list และ COUNT ต้องใช้filterเดียวกัน; string/composite keyอยู่ด้านล่างสำหรับหยิบใช้เมื่อจำเป็น
// ตาราง/คอลัมน์เป็น source code ที่แก้ตาม schema; ? ใช้กับค่าข้อมูล
const PRODUCT_SELECT = `SELECT p.id,p.sku,p.name,p.brand_id,b.name AS brand_name,
 p.category,p.price,p.ram_gb,p.storage_gb,p.color,p.stock_quantity,p.status,p.release_date
 FROM products p JOIN brands b ON b.id=p.brand_id`;
export function createRepository(db) {
  async function one(sql, values) {const [rows]=await db.query(sql,values);return rows[0] || null;}
  return {
    async listBrands(){const [rows]=await db.query('SELECT id,name,country_of_origin,website,is_active,created_at FROM brands ORDER BY id');return rows;},
    findBrand:id=>one('SELECT id,name,country_of_origin,website,is_active,created_at FROM brands WHERE id=?',[id]),
    async removeBrand(id){const [result]=await db.query('DELETE FROM brands WHERE id=?',[id]);return result.affectedRows;},
    async findAll(pagination){const values=pagination?[pagination.limit,pagination.offset]:[];const [rows]=await db.query(PRODUCT_SELECT+' ORDER BY p.id'+(pagination?' LIMIT ? OFFSET ?':''),values);return rows;},
    async countAll(){const [[{total}]]=await db.query('SELECT COUNT(*) AS total FROM products');return Number(total);},
    findOne:id=>one(PRODUCT_SELECT+' WHERE p.id=?',[id]),
    findBySku:sku=>one('SELECT id FROM products WHERE sku=?',[sku]),
    async create(data){const [result]=await db.query('INSERT INTO products SET ?',[data]);return result.insertId;},
    async update(id,data){await db.query('UPDATE products SET ? WHERE id=?',[data,id]);},
    async remove(id){const [result]=await db.query('DELETE FROM products WHERE id=?',[id]);return result.affectedRows;},
    async listTags(){const [rows]=await db.query('SELECT code,label FROM tags ORDER BY code');return rows;},
    findTag:code=>one('SELECT code,label FROM tags WHERE code=?',[code]),
    async createTag(data){await db.query('INSERT INTO tags SET ?',[data]);},
    async updateTag(code,label){await db.query('UPDATE tags SET label=? WHERE code=?',[label,code]);},
    async removeTag(code){const [result]=await db.query('DELETE FROM tags WHERE code=?',[code]);return result.affectedRows;},
    async listProductTags(id){const [rows]=await db.query('SELECT t.code,t.label FROM product_tags pt JOIN tags t ON t.code=pt.tag_code WHERE pt.product_id=? ORDER BY t.code',[id]);return rows;},
    async createProductTag(id,code){await db.query('INSERT INTO product_tags(product_id,tag_code) VALUES(?,?)',[id,code]);},
    async removeProductTag(id,code){const [result]=await db.query('DELETE FROM product_tags WHERE product_id=? AND tag_code=?',[id,code]);return result.affectedRows;},
  };
}

// Factory above only supports isolated tests; ordinary template imports use these named exports.
const repository = createRepository(db);
export const findAll = (...args) => repository.findAll(...args);
export const countAll = (...args) => repository.countAll(...args);
export const findOne = (...args) => repository.findOne(...args);
export const findBySku = (...args) => repository.findBySku(...args);
export const create = (...args) => repository.create(...args);
export const update = (...args) => repository.update(...args);
export const remove = (...args) => repository.remove(...args);
export const listBrands = (...args) => repository.listBrands(...args);
export const findBrand = (...args) => repository.findBrand(...args);
export const removeBrand = (...args) => repository.removeBrand(...args);
export const listTags = (...args) => repository.listTags(...args);
export const findTag = (...args) => repository.findTag(...args);
export const createTag = (...args) => repository.createTag(...args);
export const updateTag = (...args) => repository.updateTag(...args);
export const removeTag = (...args) => repository.removeTag(...args);
export const listProductTags = (...args) => repository.listProductTags(...args);
export const createProductTag = (...args) => repository.createProductTag(...args);
export const removeProductTag = (...args) => repository.removeProductTag(...args);
```

## src/mappers-$id/entity-dto-mapper.js

[เปิดไฟล์จริง](../src/mappers-$id/entity-dto-mapper.js)

```js
// ADAPT: class/method names match the teacher template; fields follow the example schema.
export default class EntityDtoMapper {
// ADAPT: แก้allowlist/ชื่อfield/typeตามresponseโจทย์; summaryกับdetailอาจต่างกัน
// brandNameมาจากJOINalias brand_name; ถ้าเปลี่ยนSQLต้องแก้mapperให้ตรงกัน
// Allowlist: ห้าม return {...entity} เพราะคอลัมน์ภายในอาจหลุดออกไป
static toSummaryDTO(entity) {
  return {id:entity.id, sku:entity.sku, name:entity.name, brandId:entity.brand_id,
    category:entity.category, price:Number(entity.price), status:entity.status};
}
static toDetailDTO(entity) {
  return {id:entity.id, sku:entity.sku, name:entity.name, brandId:entity.brand_id,
    brandName:entity.brand_name, category:entity.category, price:Number(entity.price),
    ramGb:entity.ram_gb, storageGb:entity.storage_gb, color:entity.color,
    stockQuantity:entity.stock_quantity, status:entity.status,
    releaseDate:entity.release_date == null ? null : entity.release_date instanceof Date
      ? entity.release_date.toISOString().slice(0,10) : String(entity.release_date)};
}

  static map(entity, viewType = 'full') {
    return viewType === 'summary' ? this.toSummaryDTO(entity) : this.toDetailDTO(entity);
  }
  static maps(entities, viewType = 'summary') {
    return entities.map(entity => this.map(entity, viewType));
  }
}
```

## src/mappers-$id/api-response.js

[เปิดไฟล์จริง](../src/mappers-$id/api-response.js)

```js
// ADAPT: เปลี่ยนenvelopeเฉพาะตามcontract: success/data/timestamp หรือ status/data
// DELETE204ไม่ผ่านhelperนี้ ใช้end(); DELETE200จึงส่งJSONตามสเปก
// ตัวอย่าง W8-like: ปรับชื่อ key/types/status ตามข้อสอบจริงเสมอ
export function success(res, data, status = 200, pagination) {
  return res.status(status).json({success:true, data,
    ...(pagination ? {pagination} : {}), timestamp:new Date().toISOString()});
}
export function metadata(total, {page,limit}) {
  return {total:Number(total),page,limit,totalPages:Math.ceil(total/limit),hasNextPage:page*limit<total,hasPrevPage:page>1};
}

// Same public signature as the teacher ZIP. Adapt body/status to the actual exam spec.
// Paginated input is {items: DTO[], totalItems: count}; never attach total to an Array.
export function apiResponse(res,data,pagination=null,status=200) {
 return pagination
  ? success(res,data.items,status,metadata(data.totalItems,pagination))
  : success(res,data,status);
}
```

## src/middlewares-$id/pagination-middleware.js

[เปิดไฟล์จริง](../src/middlewares-$id/pagination-middleware.js)

```js
// ADAPT: default page/limit, maxlimit และinvalid-query policyตามโจทย์ ไม่ยึดค่าตัวอย่างเสมอ
import { AppError } from './app-error.js';
function positiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new AppError('page and limit must be positive integers');
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) throw new AppError('page and limit must be positive integers');
  return n;
}
export function parsePagination(query = {}) {
  const page = positiveInteger(query.page, 1);
  const limit = Math.min(positiveInteger(query.limit, 10), 100);
  const offset = (page - 1) * limit;
  if (!Number.isSafeInteger(offset)) throw new AppError('Requested page is too large');
  return {page, limit, offset};
}
export function queryParser() {
 return function(req, res, next) {
  try { req.pagination = parsePagination(req.query); next(); } catch (err) { next(err); }
 };
}
```

## src/middlewares-$id/app-error.js

[เปิดไฟล์จริง](../src/middlewares-$id/app-error.js)

```js
// Error ที่แอปตั้งใจให้ client เห็น: status และ code ต้องใช้ให้ตรงกับ handler
export class AppError extends Error {
  constructor(message, status = 400, code = 'VALIDATION_ERROR') {
    super(message); this.status = status; this.code = code;
  }
}
```

## src/middlewares-$id/error-handler.js

[เปิดไฟล์จริง](../src/middlewares-$id/error-handler.js)

```js
// ADAPT: จับคู่HTTPstatus/errorcode/message/envelopeกับโจทย์จริง รวมMySQL1062/1452/1451
import { AppError } from './app-error.js';
const MYSQL_ERRORS = {
  ER_DUP_ENTRY: [409,'DUPLICATE_KEY','Resource already exists'],
  ER_NO_REFERENCED_ROW_2: [400,'FOREIGN_KEY_NOT_FOUND','Referenced record does not exist'],
  ER_ROW_IS_REFERENCED_2: [409,'RESOURCE_IN_USE','Resource is referenced by another record'],
};
export function normalizeError(err) {
  const mysql = MYSQL_ERRORS[err?.code];
  const [status, code, message] = mysql || (err instanceof AppError
    ? [err.status, err.code, err.message]
    : err?.type === 'entity.parse.failed' ? [400,'INVALID_JSON','Request body must be valid JSON']
    : [500,'INTERNAL_SERVER_ERROR','Internal server error']);
  return {status,body:{success:false,error:{code,message},timestamp:new Date().toISOString()}};
}
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const result = normalizeError(err);
  return res.status(result.status).json(result.body);
}
```

## src/configs-$id/settings.js

[เปิดไฟล์จริง](../src/configs-$id/settings.js)

```js
function port(value, fallback) {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(String(value)) || Number(value)<1 || Number(value)>65535) throw new Error('Port must be an integer from 1 to 65535');
  return Number(value);
}
export function loadSettings(env = process.env) {
  // ADAPT 1: .env ระบุ DB ของโจทย์, mode และ identity ของตัวเอง ห้าม commit password
  const dbMode = env.DB_MODE || 'practice';
  if (!['practice','exam'].includes(dbMode)) throw new Error('DB_MODE must be practice or exam');
  if (dbMode === 'exam') {
    // ห้ามใช้fallbackหรือprofileตัวอย่างไปส่งสอบ ข้อความerrorระบุชื่อfieldเท่านั้น
    const placeholders = new Set(['demo001','your_actual_id','demo student','your name','fictional-key','key_from_spec']);
    for (const field of ['DB_NAME','STUDENT_ID','STUDENT_NAME','STUDENT_KEY']) {
      const value = env[field];
      if (typeof value !== 'string' || !value.trim() || placeholders.has(value.trim().toLowerCase())) {
        throw new Error(`Exam mode requires an actual value for ${field}`);
      }
    }
  }
  const database = env.DB_NAME || 'int161_practice_catalog';
  const testDatabase = env.TEST_DB_NAME || 'int161_practice_tests';
  for (const name of [database,testDatabase]) if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(name)) throw new Error('Invalid database identifier');
  const studentId = env.STUDENT_ID || 'demo001';
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(studentId)) throw new Error('STUDENT_ID must be a static identifier, not a route parameter or path');
  return {dbMode,host:env.DB_HOST || '127.0.0.1',port:port(env.DB_PORT,3306),user:env.DB_USER || 'root',password:env.DB_PASSWORD || '',database,testDatabase,
    appPort:port(env.PORT,3000),studentId,name:env.STUDENT_NAME || 'Demo Student',key:env.STUDENT_KEY || 'fictional-key'};
}
```

## src/configs-$id/database-mode.js

[เปิดไฟล์จริง](../src/configs-$id/database-mode.js)

```js
// ADAPT: DB_MODE=practice ใช้ฐานตัวอย่าง; DB_MODE=exam ใช้ DB_NAME ตามโจทย์โดยไม่สร้าง/resetฐาน
export const MARKER='int161-exam-kit-v1';
export function assertPracticeName(name) {
  if(typeof name!=='string'||name.length>64||!/^int161_practice_[A-Za-z0-9_]+$/.test(name)) throw new Error('Refusing writes: use a dedicated int161_practice_ database');
}
export async function assertPracticeDatabase(db) {
  const [[{name}]]=await db.query('SELECT DATABASE() AS name');
  assertPracticeName(name);
  const [rows]=await db.query('SELECT value FROM _int161_kit_marker WHERE id=1');
  if(rows[0]?.value!==MARKER) throw new Error('Refusing writes: database marker does not match this kit');
}

export async function assertAppDatabase(db, config) {
  if (config.dbMode === 'practice') return assertPracticeDatabase(db);
  if (config.dbMode !== 'exam') throw new Error('DB_MODE must be practice or exam');
  // อ่านอย่างเดียว: การสร้าง/นำเข้า schema ข้อสอบทำตามไฟล์ SQL ของอาจารย์เอง
  await db.query('SELECT 1');
}
```

