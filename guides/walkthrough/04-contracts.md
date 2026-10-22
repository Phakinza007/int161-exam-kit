# บท 04 — ตรวจ DTO, Pagination และ Error ให้ตรงสเปก

เป้าหมายคือไม่หยุดแค่ “ได้ 200” แต่ตรวจชื่อ field,ชนิดข้อมูล,จำนวนรายการและกรณีผิดพลาดครบ ตัวอย่างนี้ใช้ contract ของชุดอ้างอิง ถ้าโจทย์กำหนดต่างให้แก้ตามโจทย์

## ขั้นที่ 1 — แยก Entity, DTO และ Envelope

**ทำที่ไหน:** [entity-dto-mapper.js](../../src/mappers-$id/entity-dto-mapper.js) และ [api-response.js](../../src/mappers-$id/api-response.js)

**ทำอะไร:** เทียบแถวจาก MySQL กับ response GET detail:

| ข้อมูลใน Entity | ข้อมูล DTO | แก้ตรงไหน |
| --- | --- | --- |
| brand_id | brandId | Mapper |
| brand_name จาก JOIN | brandName | Repository alias + Mapper |
| price อาจเป็น string | price เป็น number | Number ใน Mapper ตาม contract |
| internal_cost | ไม่ส่ง | ไม่ใส่ใน allowlist |

**ทำไม:** Entity คือตัวแทนข้อมูลภายใน DTO คือรูปข้อมูลรับส่ง ส่วน success/data/timestamp ชั้นนอกคือ Envelope คนละหน้าที่กัน

**ควรเห็น:** GET list ได้ Summary ไม่มี ramGb/color ส่วน detail มีข้อมูลเพิ่ม ห้าม spreadEntity แล้วส่งออกทั้งก้อน

**ถ้าไม่ผ่าน:** field หายดู SELECT/alias ก่อน Mapper; null อย่า Number(null)เป็น 0 โดยไม่ตั้งใจ; ข้อสอบไม่กำหนด timestamp ให้เอาออกจาก helper ไม่ถือว่าคีย์เพิ่มย่อมถูก

## ขั้นที่ 2 — เลือก map กับ maps

```js
// หนึ่ง Entity → หนึ่ง DTO
mapper.map(entity, 'full');
// Array ของ Entity → Array ของ DTO
mapper.maps(entities, 'summary');
```

**ทำที่ไหน:** service.getObject/getAllObjects

**ควรเห็น:** map คืน object, maps คืน array และ service ตรวจ not-found ก่อนเรียก map

**ถ้าไม่ผ่าน:** ถ้า entities.map is not a function ดูว่ารับแถวเดียวแทน array หรือไม่ ถ้าส่ง null เข้า mapper ให้ตรวจ 404 ใน service ไม่แก้ด้วย DTO เปล่าจนซ่อนการไม่พบ

## ขั้นที่ 3 — คิด Pagination ด้วยตัวเลขก่อนอ่านโค้ด

**ทำที่ไหน:** Diagram แท็บ Pagination และ [pagination-middleware.js](../../src/middlewares-$id/pagination-middleware.js)

```text
page=3, limit=10, total=23
offset=(3-1)*10=20
totalPages=ceil(23/10)=3
รายการในหน้านี้มีได้ไม่เกิน3แถว
```

**ทำอะไร:** GET /products?page=3&limit=10 แล้วตรวจ total จริงของฐานคุณ หากเคยแก้ข้อมูล total อาจไม่ใช่ 23

**ควรเห็น:** จำนวน array ไม่เกิน limit, page/limit/totalPages ถูก หน้าเกินท้ายได้ 200 กับ[]และ total เดิมตาม policy ชุดนี้ ฐานว่าง total=0,totalPages=0

**ถ้าไม่ผ่าน:** LIMIT กับ OFFSET สลับหรือไม่? ใช้ limit หลัง cap100 เดียวกันตลอดไหม? COUNT ใช้ filter เดียวกับ SELECT ไหม? ORDER BY มีลำดับแน่นอนหรือยัง?

## ขั้นที่ 4 — ดูการประกอบ response ที่ใช้จริง

**ทำที่ไหน:** route GET /products และ apiResponse

```js
const {items, total} = await implementation.getAllObjects(req.pagination);
return apiResponse(res, {items, totalItems: total}, req.pagination);
```

**ทำไม:** ส่งรายการกับยอดรวมแยกกัน ไม่แปะ totalItems ลง Array แล้วหวังว่า JSON จะส่ง property นั้นไปด้วย

**ควรเห็น:** response.data เป็น array, response.pagination เป็น object อย่าสับสนชื่อ totalItems ของ inputhelper กับ total ใน JSON ตัวอย่าง

**ถ้าไม่ผ่าน:** total=0 หายให้ดูการใช้||แทน??; ถ้าโจทย์ใช้ size แทน limit ต้องแก้ parser,route,metadata และ request ให้ครบ

## ขั้นที่ 5 — ตรวจ Error Flow

**ทำที่ไหน:** [app-error.js](../../src/middlewares-$id/app-error.js), [error-handler.js](../../src/middlewares-$id/error-handler.js), ท้าย [app.js](../../src/app.js)

```js
// ชุดนี้ใช้ constructor(message, status, code)
throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
```

**ทำไม:** Express5 ส่ง rejectedPromise จาก asyncroute ไป errorhandler ให้ ถ้าเป็น middleware ปกติใช้ next(err) Errorhandler ต้องมี 4 พารามิเตอร์และอยู่หลัง routes

**ควรเห็น:** error เป็น JSON ไม่ส่ง stack/SQL/password ให้ client ค่าที่ handler อ่านคือ err.status และ err.code

**ถ้าไม่ผ่าน:** คู่มือ Week06 บางชุดใช้ err.statusCode ถ้านำมารวมต้องแก้ class กับ handler ให้ตรง ไม่เปลี่ยนเพียงชื่อ class และไม่ catch แล้วกลืน error จน request ค้าง

## ขั้นที่ 6 — ส่งกรณีผิดแล้วดูผล

| ลองกับฐานฝึก | ควรได้ | เหตุผล |
| --- | --- | --- |
| GET /products/abc | 400 | ID ไม่ใช่จำนวนเต็มบวก |
| GET ID ที่ไม่มี | 404 | ผ่านชนิดข้อมูลแต่ไม่พบ resource |
| POST SKU ที่ซ้ำ | 409 | UNIQUE ขัดกับข้อมูลเดิม |
| POST ขาด ram_gb | 400 | required ไม่ครบ |
| GET ?page=0&limit=10 | 400 | pagination ผิด |
| DELETE แถวที่ถูก FK อ้างอิง | 409 | resource ยังถูกใช้งาน |

**ทำอะไร:** ส่งเฉพาะกรณีที่รู้ผลกับข้อมูลของตัวเอง เช่นใช้ ID ของแถวที่ลบแล้วสำหรับ 404 ไม่เดาว่าเลข 999 ไม่มีเสมอ

**ถ้าไม่ผ่าน:** 500 ที่ไม่คาดหมายอ่าน Terminal และ SQL ไม่แก้ status หลอกให้ผ่าน ส่วน schema/response ข้อสอบจริงให้ยึด contract จริงก่อนค่าของตารางนี้

## Self-check

- แยก Entity/DTO/Envelope และ map/maps ได้
- คำนวณ offset และ totalPages พร้อมกรณี 0/หน้าเกินได้
- รู้ว่า AppError ของชุดนี้อ่าน status ไม่ใช่ statusCode
- ทดสอบ 400/404/409 และ 204body ว่างได้

[บท 03](03-crud.md) · [บท 05 — Postman และ Offline](05-postman-offline.md)
