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
