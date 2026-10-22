# อ่านรายการสินค้าแบบแบ่งหน้าและ Summary DTO — คำถาม เฉลย และวิธีทำ

คำถามย่อจากงานWeek08ที่templateทำไว้แล้ว ส่วนเฉลยเป็นโค้ดของโครงนี้ ไม่ใช่โจทย์ใหม่ให้ทำเพิ่ม ลำดับ6ส่วนจัดเพื่อค้นหาโค้ด ไม่ใช่การยืนยันข้อสอบกลางภาค

## คำถาม

`GET /products?page=2&limit=10` ภายใต้basepathคงที่ `/api/รหัสของตัวเอง`

พัฒนา API อ่านรายการสินค้าพร้อม page/limit ส่งเฉพาะsummary fields: id, sku, name, brandId, category, price, status พร้อมpagination: total, page, limit, totalPages, hasNextPage, hasPrevPage และtimestamp

## วิธีคิดก่อนเขียน

- pageบอกหน้าที่ต้องการ แต่SQLใช้จำนวนแถวที่ต้องข้าม จึงหาoffset=(page-1)*limit
- page2/limit10ต้องข้าม10แถว ไม่ใช่20แถว
- ข้อมูลในหน้านี้อาจมี10แถว แต่totalอาจมี23 ต้องqueryCOUNTแยก
- summaryต้องไม่หลุดram/color/internal fields จึงmapallowlist
- limitที่ถูกcapต้องใช้ตัวเดียวกันทั้งoffset,SQLและmetadata ไม่คำนวณoffsetจากค่าเก่า

## วิธีทำทีละขั้น

1. ใส่queryParserก่อนhandlerเพื่อvalidateและnormalizepage/limit
2. ส่งreq.paginationไปserviceและrepository
3. SELECTรายการ ORDER BY id LIMIT ? OFFSET ? และCOUNT(*)ด้วยfilterเดียวกัน
4. mapper.maps(items, 'summary') แปลงpriceเป็นnumberและชื่อbrandId
5. metadataคำนวณtotalPagesและflags แล้วส่ง200พร้อมdata/pagination
6. หน้าเกินคืน[]แต่เก็บtotalจริง; total0ต้องไม่fallbackไปค่าอื่น

## เฉลย JavaScript: จุดรับ request และตอบ response

โค้ดนี้ใช้จริงในtemplate โดยservice/repository/mapperที่ต้องใช้ร่วมกันอยู่ครบตามลิงก์ถัดไป ไม่ใช่handlerเดี่ยวที่รันได้โดยไม่มีlayerอื่น

```js
// อยู่ใน src/routes-$id/route.js
// apiResponse(res, data, pagination = null, status = 200)
// R2: รายการสินค้าแบบแบ่งหน้า
 router.get('/products', queryParser(), async(req,res) => {
  const {items,total} = await implementation.getAllObjects(req.pagination);
  return apiResponse(res,{items,totalItems:total},req.pagination);
 });
```

## เช็กว่าคำตอบถูกอย่างไร

ตัวอย่างtotal23/limit10มี3หน้า page2ได้10รายการ page3ได้3รายการ page999ได้[] โดยtotalยัง23 default1/10,max100และinvalidquery400เป็นนโยบายของโครงที่ต้องปรับหากข้อสอบระบุต่างกัน

## ไฟล์ที่ใช้ร่วมกัน

- [handler ข้อนี้](../../src/routes-$id/route.js): ส่วน req/res ที่ route.js ใช้จริง
- [route](../../src/routes-$id/route.js): จุดรับ req/res และลงทะเบียน middleware
- [service](../../src/services-$id/service.js): ฟังก์ชัน `getAllObjects` และ validation
- [repository](../../src/repositories-$id/repository.js): ฟังก์ชัน `findAll / countAll` และ SQL
- [mapper](../../src/mappers-$id/entity-dto-mapper.js): summary
- [error handler](../../src/middlewares-$id/error-handler.js): แปลง error เป็น status/code/message

ไฟล์ handler ไม่ใช่คำตอบทั้งหมดเพียงไฟล์เดียว ต้องอ่าน service/repository/mapper ที่ลิงก์ไว้ด้วย ทุกไฟล์เป็น .js ปกติ แยกชั้นเหมือน teacher template ไม่มีตัวสร้างโค้ดหรือ framework เพิ่ม

## จุดปรับเมื่อนำไปใช้กับข้อสอบ

1. queryParser ตรวจ page/limit ก่อน handler แล้วเก็บ {page,limit,offset} ใน req.pagination
2. normalize limit ก่อนหา offset=(page-1)*limit ไม่ใช้ parseInt กับค่าที่มีตัวอักษรปน
3. repository SELECT รายการ ORDER BY p.id LIMIT ? OFFSET ? และ COUNT(*) ทั้งหมด
4. service map เฉพาะ summary: id,sku,name,brandId,category,price,status
5. metadata ใช้ total จริง, totalPages=Math.ceil(total/limit), hasNextPage/hasPrevPage
6. ส่ง data/pagination/timestamp; ถ้าหน้าเกินให้ [] และ total เดิม ถ้าไม่มีข้อมูล total=0 ต้องไม่ถูก fallback

## เฉลยส่วน SQL

```sql
SELECT p.id,p.sku,p.name,p.brand_id,p.category,p.price,p.status
FROM products p ORDER BY p.id LIMIT ? OFFSET ?;
SELECT COUNT(*) AS total FROM products;
```

## วิธีลองและเช็ก

เตรียมเครื่องตาม [START-HERE](../../START-HERE.th.md), เปิด `npm start` แล้วใช้ [request ตัวอย่าง](../../requests/catalog.http) เปลี่ยน productId เป็นค่าที่ POST คืนมา

ลอง page1/page2/หน้าเกิน, total0, limit500 และ page0; default limit10/max100/reject queryผิดเป็นนโยบายที่ผู้ช่วยเพิ่มเพื่อฝึก ต้องปรับตามโจทย์จริง

รัน `npm test` เพื่อตรวจทั้งระบบกับ MySQL ฐานฝึก ห้ามรันชุดเขียน/ลบของ kit ชี้ไปฐานสอบจริง ก่อนส่งตรวจ base path/body/status/DTO อีกครั้งตามโจทย์ที่ได้รับในวันสอบ
