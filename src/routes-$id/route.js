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
