import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePagination } from '../src/middlewares-$id/pagination-middleware.js';
import mapper from '../src/mappers-$id/entity-dto-mapper.js';
const summary = entity => mapper.toSummaryDTO(entity), detail = entity => mapper.toDetailDTO(entity);
import { normalizeError } from '../src/middlewares-$id/error-handler.js';
import { loadSettings } from '../src/configs-$id/settings.js';

test('pagination uses defaults, capped limit and correct offset', () => {
  assert.deepEqual(parsePagination({}), {page:1,limit:10,offset:0});
  assert.deepEqual(parsePagination({page:'3',limit:'10'}), {page:3,limit:10,offset:20});
  assert.deepEqual(parsePagination({page:'2',limit:'500'}), {page:2,limit:100,offset:100});
});
test('invalid and duplicate query values never become SQL limits', () => {
  for (const v of ['', '0','-1','1.2','abc','2abc','1e2',[],['1','2'],{},'9007199254740992']) {
    assert.throws(()=>parsePagination({page:v}), e=>e.status===400, String(v));
    assert.throws(()=>parsePagination({limit:v}), e=>e.status===400, String(v));
  }
  assert.throws(()=>parsePagination({page:'9007199254740991',limit:'100'}),e=>e.status===400);
});
test('DTOs have exact fields and numeric decimal values; no raw secrets', () => {
  const row={id:1,sku:'DEMO-A',name:'A',brand_id:2,brand_name:'Brand',category:'PHONE',price:'12.50',status:'AVAILABLE',stock_quantity:0,ram_gb:8,storage_gb:128,color:'Black',release_date:'2026-01-02',password_hash:'secret',internal_cost:'2'};
  assert.deepEqual(summary(row),{id:1,sku:'DEMO-A',name:'A',brandId:2,category:'PHONE',price:12.5,status:'AVAILABLE'});
  const d=detail(row);
  assert.deepEqual(Object.keys(d),['id','sku','name','brandId','brandName','category','price','ramGb','storageGb','color','stockQuantity','status','releaseDate']);
  assert.equal(d.releaseDate,'2026-01-02'); assert.equal(d.stockQuantity,0);
  assert.equal(detail({...row,release_date:null}).releaseDate,null);
});
test('database errors map to public contracts; unexpected errors hide details', () => {
  for (const [code,status,key] of [['ER_DUP_ENTRY',409,'DUPLICATE_KEY'],['ER_NO_REFERENCED_ROW_2',400,'FOREIGN_KEY_NOT_FOUND'],['ER_ROW_IS_REFERENCED_2',409,'RESOURCE_IN_USE']]) {
    const result=normalizeError({code,message:'SQL with password-secret'});
    assert.equal(result.status,status); assert.equal(result.body.error.code,key);
    assert.ok(!JSON.stringify(result).includes('password-secret'));
  }
  assert.equal(normalizeError(new Error('private-stack')).body.error.message,'Internal server error');
});
test('configuration rejects malformed identifiers, invalid ports, and route injection',()=>{
  assert.equal(loadSettings({}).studentId,'demo001');
  for(const env of [{DB_NAME:'x; DROP DATABASE y'},{STUDENT_ID:':id'},{STUDENT_ID:'../x'},{DB_PORT:'abc'},{PORT:'-1'}]) assert.throws(()=>loadSettings(env));
});
test('exam identity rejects missing, blank and sample profile values',()=>{
 const valid={DB_MODE:'exam',DB_NAME:'exam_db',STUDENT_ID:'my_id',STUDENT_NAME:'Actual Student',STUDENT_KEY:'actual-assigned-key'};
 for(const field of ['DB_NAME','STUDENT_ID','STUDENT_NAME','STUDENT_KEY']){
  for(const value of [undefined,'','   '])assert.throws(()=>loadSettings({...valid,[field]:value}),field);
 }
 for(const [field,value] of [['STUDENT_ID','demo001'],['STUDENT_ID','your_actual_id'],['STUDENT_NAME','Demo Student'],['STUDENT_NAME','Your Name'],['STUDENT_KEY','fictional-key'],['STUDENT_KEY','key_from_spec']])assert.throws(()=>loadSettings({...valid,[field]:value}),field);
 const cfg=loadSettings(valid);assert.equal(cfg.name,valid.STUDENT_NAME);assert.equal(cfg.key,valid.STUDENT_KEY);
 assert.equal(loadSettings({}).name,'Demo Student','practice defaults remain usable');
});
test('teacher module interfaces preserve map/maps, queryParser factory and zero-total responses',async()=>{
 const service=await import('../src/services-$id/service.js');const repo=await import('../src/repositories-$id/repository.js');
 for(const name of ['getObject','getAllObjects','createObject','updateObject','removeObject'])assert.equal(typeof service[name],'function');
 for(const name of ['findOne','findAll','create','update','remove'])assert.equal(typeof repo[name],'function');
 const {queryParser}=await import('../src/middlewares-$id/pagination-middleware.js');assert.equal(typeof queryParser(),'function');
 const {apiResponse}=await import('../src/mappers-$id/api-response.js');const res={status(code){this.code=code;return this;},json(data){this.body=data;return this;}};
 apiResponse(res,{items:[],totalItems:0},{page:1,limit:10});assert.deepEqual(res.body.data,[]);assert.equal(res.body.pagination.total,0);assert.equal(res.body.pagination.totalPages,0);
 assert.deepEqual(mapper.maps([],'summary'),[]);
});
