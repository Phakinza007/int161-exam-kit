# เพิ่มสินค้า — คำถาม เฉลย และวิธีทำ

คำถามย่อจากงานWeek08ที่templateทำไว้แล้ว ส่วนเฉลยเป็นโค้ดของโครงนี้ ไม่ใช่โจทย์ใหม่ให้ทำเพิ่ม ลำดับ6ส่วนจัดเพื่อค้นหาโค้ด ไม่ใช่การยืนยันข้อสอบกลางภาค

## คำถาม

`POST /products` ภายใต้basepathคงที่ `/api/รหัสของตัวเอง`

พัฒนา API เพิ่มสินค้า รับ JSON ที่มี sku, name, brand_id, category, price, ram_gb, storage_gb, color และฟิลด์อื่นตาม schema บันทึกลง MySQL สำเร็จตอบ201 หาก SKU ซ้ำตอบ409 ส่งข้อมูลกลับตาม response contract

## วิธีคิดก่อนเขียน

- ต้องบันทึกจริง จึงต้องมีINSERT ไม่ใช่ส่งbodyเดิมกลับอย่างเดียว
- brand_idอ้างอิงbrands; ถ้าปลายทางไม่มีต้องจัดการFKerror
- skuห้ามซ้ำ ใช้precheckเพื่อข้อความอ่านง่ายและDB UNIQUEเพื่อกันการชนพร้อมกัน
- ไม่ให้clientกำหนดidหรือinternal_cost จึงเลือกฟิลด์ก่อนส่งSQL
- สร้างแล้วต้องอ่านกลับด้วยinsertId จึงได้ค่าที่DBกำหนดและbrandNameจากJOINสำหรับdetailDTO

## วิธีทำทีละขั้น

1. อ่านbodyที่handler ใน route.js แล้วส่งให้service.createObject
2. productInputตรวจ8ฟิลด์บังคับ ชนิดnumber/stringและNOT NULL ให้ตรงschema
3. findBySkuตรวจซ้ำ แล้วcreateProductในrepository INSERT objectที่ผ่านallowlistแล้ว
4. ใช้insertIdอ่านfindProductพร้อมJOIN แปลงdetailDTO
5. handler ใน route.jsตอบ201; duplicateหรือFKerrorส่งเข้าmiddlewareกลาง

## เฉลย JavaScript: จุดรับ request และตอบ response

โค้ดนี้ใช้จริงในtemplate โดยservice/repository/mapperที่ต้องใช้ร่วมกันอยู่ครบตามลิงก์ถัดไป ไม่ใช่handlerเดี่ยวที่รันได้โดยไม่มีlayerอื่น

```js
// อยู่ใน src/routes-$id/route.js
// apiResponse(res, data, pagination = null, status = 200)
// C1: รับ body แล้วคืน DTO พร้อม 201
 router.post('/products', async(req,res) => {
  const object = await implementation.createObject(req.body);
  return apiResponse(res,object,null,201);
 });
```

## เช็กว่าคำตอบถูกอย่างไร

ลองใช้bodyในหัวข้อด้านล่าง เก็บdata.idที่POSTคืน แล้วGETตามidนั้น ต้องพบข้อมูลจริง ส่งSKUเดิมซ้ำต้อง409 และตัดram_gbออกต้อง400 ไม่ใช่500

## ไฟล์ที่ใช้ร่วมกัน

- [handler ข้อนี้](../../src/routes-$id/route.js): ส่วน req/res ที่ route.js ใช้จริง
- [route](../../src/routes-$id/route.js): จุดรับ req/res และลงทะเบียน middleware
- [service](../../src/services-$id/service.js): ฟังก์ชัน `createObject` และ validation
- [repository](../../src/repositories-$id/repository.js): ฟังก์ชัน `create / findBySku / findOne` และ SQL
- [mapper](../../src/mappers-$id/entity-dto-mapper.js): detail
- [error handler](../../src/middlewares-$id/error-handler.js): แปลง error เป็น status/code/message

ไฟล์ handler ไม่ใช่คำตอบทั้งหมดเพียงไฟล์เดียว ต้องอ่าน service/repository/mapper ที่ลิงก์ไว้ด้วย ทุกไฟล์เป็น .js ปกติ แยกชั้นเหมือน teacher template ไม่มีตัวสร้างโค้ดหรือ framework เพิ่ม

## จุดปรับเมื่อนำไปใช้กับข้อสอบ

1. รับ body เป็น snake_case จากโจทย์ เช่น sku/name/brand_id/category/price รวมรายละเอียดสเปกโทรศัพท์
2. service.productInput ตรวจชนิดและเลือกฟิลด์ที่อนุญาต ไม่ส่ง req.body ทั้งก้อนลงฐาน
3. เช็ก SKU ซ้ำ จากนั้น INSERT ด้วย parameter binding และอ่าน result.insertId
4. SELECT ใหม่พร้อม JOIN brands เพื่อคืน detail DTO แล้วตอบ201
5. UNIQUE ใน DB ยังต้องมี เพราะการเช็กก่อน INSERT อย่างเดียวกัน request พร้อมกันไม่ได้

## เฉลยส่วน SQL

```sql
INSERT INTO products SET ?;
-- mysql2.query รับ [data] โดย data ผ่าน allowlist แล้ว
```

## Body สำหรับลอง

```json
{"sku":"PRACTICE-NEW-001","name":"Practice Phone","brand_id":1,"category":"FLAGSHIP","price":29900,"ram_gb":8,"storage_gb":256,"color":"Black","stock_quantity":10,"status":"AVAILABLE","release_date":"2026-01-01"}
```

## วิธีลองและเช็ก

เตรียมเครื่องตาม [START-HERE](../../START-HERE.th.md), เปิด `npm start` แล้วใช้ [request ตัวอย่าง](../../requests/catalog.http) เปลี่ยน productId เป็นค่าที่ POST คืนมา

ส่ง body เดิมซ้ำต้อง409 ไม่ใช่500 เก็บ data.id ที่ได้ไว้ใช้กับข้อ detail/update/delete

รัน `npm test` เพื่อตรวจทั้งระบบกับ MySQL ฐานฝึก ห้ามรันชุดเขียน/ลบของ kit ชี้ไปฐานสอบจริง ก่อนส่งตรวจ base path/body/status/DTO อีกครั้งตามโจทย์ที่ได้รับในวันสอบ
