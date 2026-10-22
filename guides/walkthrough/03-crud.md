# บท 03 — ไล่ CRUD ทีละไฟล์ ก่อนทดสอบทั้งระบบ

เป้าหมายคืออ่านแล้วชี้ได้ว่าแต่ละงานต้องแก้ไฟล์ไหน โครงนี้เขียนครบแล้ว ไม่ต้องลบโค้ดเพื่อเริ่มใหม่ และไม่ต้องสร้าง Controller เพิ่ม ขั้นตอนต่อไปเป็นการไล่ของจริงและปรับตามสเปก

## ขั้นที่ 1 — ทดสอบ Repository แบบอ่านอย่างเดียว

**ทำที่ไหน:** เปิด [repository.js](../../src/repositories-$id/repository.js) ดู findAll/findOne และ PRODUCT_SELECT

**ทำอะไร:** อ่าน SQL: FROM products, JOIN brands, WHERE p.id=? และ ORDER BY p.id จากนั้นเปิด [test-service.js](../../src/test-service.js) ซึ่งเป็น read-only smoke check แล้วรันจาก Terminal:

```sh
node --env-file-if-exists=.env src/test-service.js
```

**ทำไม:** ตรวจ SQL และการอ่านข้อมูลก่อนส่ง HTTP ไฟล์ทดสอบนี้เรียก service.getAllObjects() → repository.findAll() → mapper แล้วปิด db.end() ใน finally จึงจบเอง ไม่ต้องปล่อย pool ค้าง

**ควรเห็น:** ข้อมูลสินค้าเป็น array และ process จบ ถ้าอยากดู SQL เดี่ยว ให้รัน SELECT ของบท 02 ใน Query Console ไม่ต้องเปิด port3000 เพิ่ม

**ถ้าไม่ผ่าน:** Unknown column/table = repository/schema, ACCESS_DENIED = config ถ้าไม่พบ module = import/path/dependencies ยังไม่ไปแก้ Postman เพราะขั้นนี้ไม่ได้ใช้ HTTP

## ขั้นที่ 2 — เข้าใจ Service และชื่อ implementation

**ทำที่ไหน:** [service.js](../../src/services-$id/service.js) และ [route.js](../../src/routes-$id/route.js)

**ทำอะไร:** หา createService(repo) และ createRouter(implementation = service, identity = {}) ในไฟล์ route คำว่า implementation คือ object ของ service ที่ใช้เรียก getObject/createObject ฯลฯ ไม่ใช่ package อีกตัว

```js
// จาก app.js: ประกอบครั้งเดียวตอนเริ่มแอป
const repo = createRepository(db);
const service = createService(repo);
app.use(`/api/${studentId}`, createRouter(service, {studentId, name, key}));
```

**ทำไม:** factories เป็น helper ที่เพิ่มเพื่อทดสอบแยกฐานข้อมูล ชื่อฟังก์ชันปกติยัง export เหมือน template เช่น service.getObject และ repo.findOne การส่ง service เข้า router ไม่ได้เพิ่ม Controller layer

**ควรเห็น:** Router รู้ req/res, Service รู้กฎ, Repository รู้ SQL ส่วน Mapper แปลง Entity เป็น DTO

**ถ้าไม่ผ่าน:** เปิด Diagram ภาพรวมด้านบน กดแต่ละกล่องแล้วเทียบ import อย่าก๊อป snippet ที่ใช้ implementation ไปวางนอก createRouter โดยไม่เปลี่ยนตัวแปรให้ถูก scope

## ขั้นที่ 3 — R1: รายการแบรนด์

**ทำที่ไหน:** route GET /brands → service.listBrands → repo.listBrands

**ทำอะไร:** ไล่ SELECT id/name/... FROM brands ORDER BY id แล้วดู route เรียก apiResponse(res, array)

**ควรเห็น:** GET http://127.0.0.1:3000/api/demo001/brands ได้ 200, data เป็น array โครงนี้เลือกคอลัมน์ brands ไว้ใน SQL ไม่ได้ผ่าน product mapper

**ถ้าไม่ผ่าน:** ถ้าได้ 404 ดู basepath/method ถ้า 500 ดูชื่อตาราง SQL ถ้า field มากเกินสเปกให้เพิ่ม allowlist/mapper ของ brands เองตามโจทย์

[คู่มือและเฉลย R1](../operations/02-read-brands.md)

## ขั้นที่ 4 — R2: รายการสินค้าแบบแบ่งหน้า

**ทำที่ไหน:** route GET /products ที่มี queryParser() ก่อน async handler

```js
router.get('/products', queryParser(), async (req, res) => {
  const {items, total} = await implementation.getAllObjects(req.pagination);
  return apiResponse(res, {items, totalItems: total}, req.pagination);
});
```

**ทำไม:** middleware สร้าง req.pagination; Service ขอทั้งรายการกับ COUNT แล้ว map Summary; apiResponse แยก data array และ metadata ไม่แปะ property ลง array

**ควรเห็น:** GET /products?page=2&limit=10 ได้ 200, data ไม่เกิน 10 แถว และ pagination.page=2,total เป็นจำนวนทั้งหมด

**ถ้าไม่ผ่าน:** req.pagination ไม่มีให้ดู queryParser() ใน route จำนวนหน้าผิดให้ดู COUNT/limit ใน repository และ helper ไม่เอา rows.length ของหน้าปัจจุบันมานับทั้งหมด

[คู่มือและเฉลย R2](../operations/03-read-products.md)

## ขั้นที่ 5 — R3: รายตัว

**ทำที่ไหน:** route GET /products/:id → numericId → service.getObject → repo.findOne → EntityDtoMapper.map

**ทำอะไร:** เลือก id ที่เห็นจากรายการจริง แล้วส่ง GET /products/เลขนั้น

**ควรเห็น:** data เป็น object มี brandName จาก JOIN ถ้าใช้เลขไม่มีได้ 404, abc ได้ 400 ตาม validation ของชุดนี้

**ถ้าไม่ผ่าน:** ถ้า response เป็น array ดู rows[0]; ถ้า brandName หายดู SQLalias brand_name และ Mapper; ถ้า 500 ตอน not-found ให้ดูว่าตรวจ null ก่อน map หรือยัง

[คู่มือและเฉลย R3](../operations/04-read-product-detail.md)

## ขั้นที่ 6 — C1: เพิ่มข้อมูลของตัวเอง

**ทำที่ไหน:** route POST /products → service.createObject → productInput → repo.create

**ทำอะไร:** ส่ง body จาก [คู่มือ Create](../operations/01-create-product.md) จด data.id และ sku ที่ได้ อย่าใช้เลขคงที่จากตัวอย่างคนอื่น

```js
// service เลือกเฉพาะข้อมูลที่ผ่าน validation
const data = productInput(body);
// repo.create ใช้ INSERT ... SET ? ด้วย mysql2.query
const id = await repo.create(data);
// อ่านกลับก่อน map เพื่อให้ได้ค่าจริงจาก DB
return mapper.map(await getObject(id));
```

**ทำไม:** id เป็น auto increment จึงใช้ insertId; body ที่รับไม่เท่ากับ Entity ที่เก็บจริง ต้องอ่านกลับพร้อม JOIN และแปลง DTO

**ควรเห็น:** 201, data.id ใหม่ และ GET ID นั้นพบข้อมูล ส่ง sku เดิมซ้ำได้ 409 ตัด ram_gb ออกได้ 400

**ถ้าไม่ผ่าน:** FK ไม่มีให้ตรวจ brand_id, NOT NULL ให้ตรวจ productInput/required, อย่าส่ง req.body ทั้งก้อนลง SQL ถ้าข้อสอบใช้ stringPK ต้องเปลี่ยนวิธีอ่านกลับไม่ใช้ insertId

## ขั้นที่ 7 — U1: แก้เฉพาะแถวที่เพิ่งสร้าง

**ทำที่ไหน:** route PUT /products/:id → service.updateObject(id,body) → repo.update

**ทำอะไร:** ใช้ id จากขั้น 6 ส่ง fullbody เดิมแต่เปลี่ยน name ตรวจ route ส่งทั้ง id และ req.body ไม่ใช่เรียก updateObject()เปล่า

**ทำไม:** Service ตรวจ existing ก่อน, อนุญาต SKU เดิมของตัวเอง, UPDATE ใช้ WHEREid ครบ แล้ว SELECT กลับให้ DTO ล่าสุด

**ควรเห็น:** 200 และ GET อีกครั้งเห็นชื่อใหม่ ส่ง body เดิมซ้ำยัง 200 ไม่ใช่ 404 จาก changedRows0

**ถ้าไม่ผ่าน:** 400 เมื่อส่งแค่ name เพราะชุดนี้ใช้ fullPUT, 409 หาก SKU ชนแถวอื่น, 404 หาก id ไม่มี การใช้ PATCH/partial ต้องแก้ validation และ SQL ตามสเปก ไม่ใช่เปลี่ยน method อย่างเดียว

[คู่มือและเฉลย U1](../operations/05-update-product.md)

## ขั้นที่ 8 — D1: ลบแล้วตรวจซ้ำ

**ทำที่ไหน:** route DELETE /products/:id → service.removeObject → repo.remove

**ทำอะไร:** ลบ ID ของตัวเองจากขั้น 6 แล้ว GET เลขเดิมอีกครั้ง

**ควรเห็น:** DELETE204 และ body ว่าง; GET หลังลบ 404

**ถ้าไม่ผ่าน:** 409RESOURCE_IN_USE หมายถึงมี FK อ้างอิง ตรวจความสัมพันธ์ ไม่ปิด FK หรือลบแถวอื่นเพื่อให้เทสต์ผ่าน หาก 404 ทันทีดูว่าใช้ ID ผิดหรือเคยลบแล้ว

[คู่มือและเฉลย D1](../operations/06-delete-product.md)

## ก่อนปรับเป็นโจทย์ของตัวเอง

จด method/path/schema/key/body/DTO/status ใน [Contract Sheet](../01-contract.md) แล้วแก้ repository → validation ใน service → mapper → req/res ใน route ทุกครั้งที่แก้ source ต้องหยุด npm start แล้วเริ่มใหม่ ทดสอบ SQL/read ก่อน write ตามลำดับเดิม

## Self-check

- ชี้ส่วน req/res ใน route.js และจุด SQL ใน repository.js ได้
- รู้ว่า implementation คือ service และ factory เป็น helper สำหรับประกอบ/ทดสอบ
- ทดลองครบ 6 งานด้วยแถวของตัวเองแล้ว
- แยกปัญหาฐานข้อมูลออกจากปัญหา URL/response ได้

[บท 02](02-database.md) · [บท 04 — DTO/Pagination/Error](04-contracts.md)
