# แก้ไขสินค้าตาม ID — คำถาม เฉลย และวิธีทำ

คำถามย่อจากงานWeek08ที่templateทำไว้แล้ว ส่วนเฉลยเป็นโค้ดของโครงนี้ ไม่ใช่โจทย์ใหม่ให้ทำเพิ่ม ลำดับ6ส่วนจัดเพื่อค้นหาโค้ด ไม่ใช่การยืนยันข้อสอบกลางภาค

## คำถาม

`PUT /products/:id` ภายใต้basepathคงที่ `/api/รหัสของตัวเอง`

พัฒนา API แก้ไขสินค้าตามid บันทึกสำเร็จตอบ200 หากไม่พบidตอบ404 โครงนี้ใช้full bodyเหมือนPOST และตรวจSKUชนกับอีกแถวเป็น409

## วิธีคิดก่อนเขียน

- UPDATEอาจเปลี่ยน0แถวเพราะส่งค่าเดิม จึงไม่ใช้changedRows0แปลว่าไม่มีresource
- ต้องแยกSKUเดิมของตัวเองออกจากSKUที่เป็นของอีกid
- priceและstockที่0เป็นค่าถูกต้อง อย่าใช้||จนกลายเป็นdefault
- อ่านแถวกลับหลังUPDATEเพื่อให้DTOตรงค่าที่DBเก็บ

## วิธีทำทีละขั้น

1. getProductตรวจว่ามีidก่อน หากไม่มีthrow404
2. productInputตรวจfull bodyและallowlist
3. findBySkuแล้วเทียบother.idกับidที่กำลังแก้ ถ้าเป็นอีกแถวthrow409
4. UPDATE SET ? WHERE id=?
5. SELECTกลับพร้อมJOINและdetailDTO แล้วตอบ200 แม้ข้อมูลเหมือนเดิมทุกฟิลด์

## เฉลย JavaScript: จุดรับ request และตอบ response

โค้ดนี้ใช้จริงในtemplate โดยservice/repository/mapperที่ต้องใช้ร่วมกันอยู่ครบตามลิงก์ถัดไป ไม่ใช่handlerเดี่ยวที่รันได้โดยไม่มีlayerอื่น

```js
// อยู่ใน src/routes-$id/route.js
// apiResponse(res, data, pagination = null, status = 200)
// U1: ส่งทั้ง id และ body ไป service (ไม่เรียก updateObject() เปล่า)
 router.put('/products/:id', async(req,res) => {
  const object = await implementation.updateObject(numericId(req.params.id),req.body);
  return apiResponse(res,object);
 });
```

## เช็กว่าคำตอบถูกอย่างไร

ส่งPUTสองครั้งด้วยbodyเดิมต้อง200ทั้งคู่ เปลี่ยนpriceเป็น0แล้วGETต้องได้0 เปลี่ยนSKUไปชนอีกสินค้าต้อง409 และidไม่มีต้อง404 Full-body/duplicatevalidationเป็นนโยบายของโครงในส่วนที่ใบงานไม่ได้แจกแจง

## ไฟล์ที่ใช้ร่วมกัน

- [handler ข้อนี้](../../src/routes-$id/route.js): ส่วน req/res ที่ route.js ใช้จริง
- [route](../../src/routes-$id/route.js): จุดรับ req/res และลงทะเบียน middleware
- [service](../../src/services-$id/service.js): ฟังก์ชัน `updateObject` และ validation
- [repository](../../src/repositories-$id/repository.js): ฟังก์ชัน `findOne / findBySku / update` และ SQL
- [mapper](../../src/mappers-$id/entity-dto-mapper.js): detail
- [error handler](../../src/middlewares-$id/error-handler.js): แปลง error เป็น status/code/message

ไฟล์ handler ไม่ใช่คำตอบทั้งหมดเพียงไฟล์เดียว ต้องอ่าน service/repository/mapper ที่ลิงก์ไว้ด้วย ทุกไฟล์เป็น .js ปกติ แยกชั้นเหมือน teacher template ไม่มีตัวสร้างโค้ดหรือ framework เพิ่ม

## จุดปรับเมื่อนำไปใช้กับข้อสอบ

1. ตรวจว่ามี id ก่อน ถ้าไม่พบ throw404
2. ชุดฝึกใช้ full body เหมือน POST: ผ่าน productInput และ allowlist
3. ถ้า SKU ถูกใช้โดยอีก id ตอบ409 แต่ SKUเดิมของตัวเองใช้ได้
4. UPDATE WHERE id=? ด้วย data ที่ตรวจแล้ว
5. SELECT กลับแล้วส่ง detail DTO200 ห้ามใช้ changedRows===0 แปลว่าไม่มีแถว เพราะการส่งค่าเดิมเป็น update ที่สำเร็จได้

## เฉลยส่วน SQL

```sql
UPDATE products SET ? WHERE id=?;
-- parameters: [data, id]
```

## Body สำหรับลอง

```json
{"sku":"PRACTICE-NEW-001","name":"Practice Phone Updated","brand_id":1,"category":"FLAGSHIP","price":0,"ram_gb":8,"storage_gb":256,"color":"Black","stock_quantity":10,"status":"AVAILABLE","release_date":"2026-01-01"}
```

## วิธีลองและเช็ก

เตรียมเครื่องตาม [START-HERE](../../START-HERE.th.md), เปิด `npm start` แล้วใช้ [request ตัวอย่าง](../../requests/catalog.http) เปลี่ยน productId เป็นค่าที่ POST คืนมา

ส่งค่าเดิมซ้ำยัง200, price0คง0, GETซ้ำเห็นชื่อใหม่; full-body PUT และ validation ละเอียดเป็นนโยบายผู้ช่วยเพิ่ม ใบงานจริงระบุ status200/404 แต่ไม่ได้แจกแจงทุกเงื่อนไข

รัน `npm test` เพื่อตรวจทั้งระบบกับ MySQL ฐานฝึก ห้ามรันชุดเขียน/ลบของ kit ชี้ไปฐานสอบจริง ก่อนส่งตรวจ base path/body/status/DTO อีกครั้งตามโจทย์ที่ได้รับในวันสอบ
