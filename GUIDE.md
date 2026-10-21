# GUIDE — ใช้โครงนี้ทำข้อสอบทีละขั้น

คู่มือนี้สำหรับ **int161-exam-kit** ที่ใช้ products/brands และ folder `services-$id`, `repositories-$id` โค้ดใน `src/` ทำงานครบอยู่แล้ว ใช้เป็นโครงอ้างอิงแล้วปรับตามสเปกที่ได้รับ ไม่ใช่ไฟล์พร้อมส่งทุกข้อสอบ

ถ้าคุณกำลังเปิด `project/` แบบ Students API ที่ดาวน์โหลดจากเว็บ ให้ใช้ GUIDE.md ภายในโฟลเดอร์นั้นแทน ชื่อไฟล์และรูปแบบ response ของสองชุดต่างกัน

เปิดคู่มือนี้พร้อม source บน localhost ได้ด้วย `npm run study` → http://127.0.0.1:8171 ส่วนการเชื่อม API ดู [POSTMAN.md](POSTMAN.md)

## สารบัญ / เปิดตรงไหนเมื่อมีเวลาไม่มาก

| ต้องการ | อ่านส่วน |
| --- | --- |
| เพิ่งโหลดมา ยังรันไม่เป็น | 1–2 |
| ไม่รู้ว่าไฟล์ไหนทำอะไร | 3–4 |
| ได้โจทย์แล้ว ไม่รู้จะเริ่มตรงไหน | 5–6 |
| ปรับ CRUD แต่ละข้อ | 7 |
| DTO / Pagination / Exception | 8–10 |
| ทดสอบ แก้ error และส่งงาน | 11–14 |

อ่าน [คำถามพร้อมเฉลย วิธีคิดและวิธีทำ](QUESTIONS-AND-ANSWERS.md) คู่กันได้ ส่วนหน้านี้เน้นวิธีใช้และแก้ template ที่มีอยู่ ไม่เพิ่มโจทย์ใหม่

## 1. ก่อนเริ่ม: แยกของตัวอย่างกับของสอบ

ประกาศภาคปฏิบัติระบุ 6 ข้อ: 1 Create, 3 Read, 1 Update, 1 Delete เน้น CRUD, DTO, Pagination และ Exception Handling แต่ไม่ได้บอกว่า Read ทั้งสามต้องเป็น endpoint ใด

โครงนี้เลือก brands list, products list และ product detail เป็น 3 Read หลัก **ไม่ได้หมายความว่าข้อสอบจริงจะใช้สามแบบนี้** routes ของ tags, string key และ composite key เป็นตัวอย่างเสริมสำหรับหยิบใช้เฉพาะเมื่อสเปกต้องการ

สิ่งที่ต้องอ่านจากโจทย์ก่อนเขียนโค้ด:

- Method และ path ต้องตรง รวม prefix รหัสนักศึกษา
- ฐานข้อมูล ตาราง คอลัมน์ และชนิด key
- Body ที่รับ: ชื่อ ชนิด required/optional และยอมรับ null หรือไม่
- Response: key, ชนิดข้อมูล, DTO, envelope และ pagination metadata
- กรณีสำเร็จและผิดพลาด: HTTP status, error code และข้อความที่กำหนด

ค่าตัวอย่างในคู่มือนี้ เช่น `/api/demo001`, products, limit 10 และ status ของแต่ละ endpoint ใช้ยืนยันพฤติกรรมของโครงนี้เท่านั้น ให้เปลี่ยนเมื่อสเปกสอบกำหนดต่างออกไป

## 2. เปิดโครงให้ได้ก่อนแก้

### 2.1 เตรียมในช่วงที่ใช้อินเทอร์เน็ตได้

ต้องมี Node.js >=22.9, npm, MySQL ที่เปิดใช้งาน และ editor/เครื่องมือส่ง HTTP request ในเครื่อง

```sh
git clone https://github.com/Phakinza007/int161-exam-kit.git
cd int161-exam-kit
npm ci
cp .env.example .env
```

ถ้าใช้ ZIP ให้แตกแล้วเปิด Terminal ในโฟลเดอร์ที่มี `package.json` ไม่ใช่โฟลเดอร์ชั้นนอก `npm ci` ติดตั้งจาก `package-lock.json`; ZIP ไม่รวม `node_modules` ต้องทำขั้นนี้ก่อนตัดอินเทอร์เน็ต

### 2.2 แก้ .env ของเครื่องตัวเอง

```dotenv
DB_MODE=practice
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=int161_practice_catalog
TEST_DB_NAME=int161_practice_tests
PORT=3000
STUDENT_ID=demo001
STUDENT_NAME=Demo Student
STUDENT_KEY=fictional-key
```

DB_PASSWORD ต้องตรงกับ MySQL เครื่องคุณ ค่า PORT คือ port ของ API ส่วน DB_PORT คือ port ของ MySQL ซึ่งเป็นคนละอย่างกัน `.env` เป็นไฟล์ส่วนตัว ไม่ต้องใส่ลง Git

```sh
npm run db:init
npm run doctor
npm start
```

- `db:init`: สร้างตารางและข้อมูลตัวอย่างในฐานฝึกของชุดนี้
- `doctor`: ตรวจ dependencies และเชื่อมต่อฐานด้วย SELECT แบบอ่านอย่างเดียว ไม่ตรวจว่า SQL ทุก endpoint ถูก
- `start`: เปิด HTTP server; ต้องปล่อย Terminal นี้ทำงานอยู่ กด Ctrl+C เพื่อหยุด

เปิด `http://127.0.0.1:3000/api/demo001/products?page=1&limit=10` ควรได้ HTTP 200 มี `success`, `data` เป็น array, `pagination` และ `timestamp`

หากฐานชื่อเดียวกันมีอยู่แต่ไม่มี marker ของชุดนี้ `db:init` จะปฏิเสธ ให้ใช้ชื่อฐานฝึกใหม่ที่ขึ้นต้น `int161_practice_` ไม่เติม marker เองลงฐานที่ไม่รู้ที่มา รายละเอียดอยู่ใน [START-HERE](START-HERE.th.md)

### 2.3 เมื่อต่อฐานตามโจทย์จริง

ตั้ง `DB_MODE=exam`, DB_NAME และ STUDENT_ID/STUDENT_NAME/STUDENT_KEY เป็นค่าจริงครบตามที่กำหนด โหมดนี้ไม่ยอมใช้ identity ตัวอย่าง ต้องนำเข้า SQL อาจารย์ตามคำสั่ง และปรับโค้ดให้ตรง schema ก่อนส่ง request เขียนข้อมูล

ใช้ `npm run doctor` และ `npm start` ได้ แต่ **ไม่ใช้ db:init หรือ npm test ของโครงนี้กับฐานสอบ** เพราะชุดทดสอบจัดการ fixture ของฐานฝึก ไม่ใช่ runner ตรวจข้อสอบจริง

## 3. แผนที่ไฟล์: งานแบบไหนแก้ที่ไหน

| ไฟล์/ตำแหน่ง | ทำอะไร | เมื่อไรต้องแก้ |
| --- | --- | --- |
| [src/server.js](src/server.js) | โหลด config ต่อ DB และ listen | entrypoint หรือ port ตาม template |
| [src/app.js](src/app.js) | ประกอบ layers, JSON parser, prefix, error handler | เปลี่ยน base path หรือ router |
| [settings.js](src/configs-$id/settings.js) | อ่าน .env / mode / identity | config ของโจทย์ |
| [db-config.js](src/configs-$id/db-config.js) | สร้าง MySQL pool | ตัวเลือกเชื่อมต่อ |
| [catalog-route.js](src/routes-$id/catalog-route.js) | method/path → handler | endpoint, params, middleware |
| [controllers](src/controllers-$id) | req → service → HTTP response | อ่าน input / status / response |
| [catalog-service.js](src/services-$id/catalog-service.js) | validation, duplicate, not-found, DTO | body และ business rules |
| [catalog-repository.js](src/repositories-$id/catalog-repository.js) | SQL และผลฐานข้อมูล | schema, JOIN, WHERE, key |
| [product-mapper.js](src/mappers-$id/product-mapper.js) | Entity → summary/detail DTO | ชื่อและชนิด field ที่ส่งออก |
| [api-response.js](src/mappers-$id/api-response.js) | success envelope และ metadata | โครง JSON ชั้นนอก |
| [pagination.js](src/middlewares-$id/pagination.js) | ตรวจ query และคำนวณ offset | default, max, invalid policy |
| [app-error.js](src/middlewares-$id/app-error.js) | custom error | constructor ที่ handler อ่าน |
| [error-handler.js](src/middlewares-$id/error-handler.js) | error → status/JSON | error contract |

ไม่จำเป็นต้องแก้ทุกไฟล์ในทุกข้อ เช่น ถ้าเปลี่ยนชื่อ field ใน response อย่างเดียว อาจแก้ mapper; ถ้า field นั้นต้องมาจากอีกตาราง ต้องแก้ repository JOIN/alias ด้วย

## 4. ไล่หนึ่ง Request ตั้งแต่เข้าไปจนตอบกลับ

ตัวอย่าง `GET /api/demo001/products/7`:

```text
Client → express.json → /api/demo001 → GET /products/:id
       → controller อ่าน req.params.id เป็น "7"
       → numericId ตรวจและแปลงเป็น 7
       → service.getProduct(7)
       → repo.findProduct(7) → SQL + MySQL
       ← entity หรือ null
       → service ตรวจพบ/ไม่พบ → detail(entity)
       ← DTO → controller → success(res, DTO) → HTTP 200 + JSON
```

ถ้า repository คืน null: service โยน AppError 404 → Express 5 ส่ง rejected Promise เข้า error handler → HTTP 404 + error envelope ไม่เรียก mapper ด้วย null

จำหน้าที่จากโค้ด:

```js
// Controller: จัดการ HTTP
const dto = await service.getProduct(numericId(req.params.id));
return success(res, dto);

// Repository: ดึงแถว; ไม่ใช้ res/req
findProduct: id => one(PRODUCT_SELECT + ' WHERE p.id=?', [id])

// Mapper: สร้างข้อมูลออก; ไม่ query DB
price: Number(entity.price)
```

`await` จำเป็นเพราะ service/repository คืน Promise ถ้าลืมอาจส่งข้อมูลที่ยังไม่เสร็จ แทนผล query

## 5. แปลงสเปกเป็นรายการแก้โค้ด

จดก่อนลงมือ ใช้ [Contract Sheet](guides/01-contract.md) ได้:

```text
Method/path:
Path params และชนิด:
Query + default/max:
Body: field / type / required / nullable / default
Table / PK / FK / UNIQUE:
Success: HTTP status / DTO / envelope
Errors: condition → status / code / message
```

ตัวอย่างวิธีคิด: สเปกบอกว่า response ต้องมี `brandName`

1. หาว่าข้อมูลอยู่ตารางใด: ในโครงนี้คือ brands.name
2. Repository JOIN brands แล้ว alias `brand_name`
3. Mapper อ่าน `entity.brand_name` แล้วส่ง key `brandName`
4. Controller ใช้ detail DTO ไม่ใช่ summary ซึ่งไม่มี field นี้
5. ตรวจ JSON จริงว่ามีค่าและชนิดถูก อย่าตรวจแค่ HTTP 200

หากสเปกเปลี่ยนจาก products เป็น resource อื่น ให้จด mapping ของทุกชื่อก่อน rename เพื่อไม่ให้ SQL เปลี่ยนแล้ว service/mapper ยังอ้างชื่อเดิม

## 6. ลำดับแก้ที่แนะนำ

1. ตั้ง DB/identity และเปิด schema อาจารย์
2. แก้ repository ให้ SELECT ตาราง/คอลัมน์และ key ถูกก่อน
3. แก้ validation และ business rules ใน service
4. แก้ mapper และ response envelope
5. แก้ controller/route ให้ method/path/input/status ตรง
6. แก้ pagination และ error contract
7. ทดสอบ happy path → negative cases → persistence

ค้น `ADAPT` ใน editor เพื่อเห็นจุดปรับ แต่ไม่ใช้ search/replace เปลี่ยนทุกคำโดยไม่อ่าน เช่น field ของ DB อาจเป็น snake_case แต่ API ต้องเป็น camelCase

## 7. วิธีปรับ CRUD ทั้ง 6 รูปแบบ

### 7.1 Create — เพิ่มข้อมูล

เปิด [controller Create](src/controllers-$id/01-create-product.js), `createProduct`/`productInput` ใน service และ `createProduct` ใน repository

```text
req.body → ตรวจชนิด/required → allowlist
         → เช็ก unique → INSERT → อ่านแถวใหม่ → detail DTO → 201
```

ในโครงนี้ body ขั้นต่ำคือ:

```json
{
  "sku": "MANUAL-001", "name": "Manual Phone", "brand_id": 1,
  "category": "PHONE", "price": 1200.5,
  "ram_gb": 8, "storage_gb": 128, "color": "Black"
}
```

`stock_quantity` ไม่ส่งจะใช้ 0, `status` ใช้ AVAILABLE, `release_date` ใช้ null ตามกฎของโครงนี้ ไม่ใช่ default ของทุกข้อสอบ

- แก้ productInput ให้คืน object เฉพาะ field ที่อนุญาต ไม่ส่ง req.body ทั้งก้อนลง SQL
- `INSERT ... SET ?` ในชุดนี้ใช้ **mysql2.query** กับ object ที่ผ่าน allowlist แล้ว ถ้าเปลี่ยนเป็น execute ให้ใช้ `(columns) VALUES (?,...)` และ array ของค่าแทน
- auto increment ใช้ result.insertId; string PK อ่านกลับด้วย key ที่ส่งมา ไม่ใช้ SELECT MAX(id)
- precheck unique ช่วยให้ error ชัด แต่ยังต้องจับ ER_DUP_ENTRY เมื่อมี request ชนกัน

### 7.2 Read 1 — รายการที่ไม่แบ่งหน้า

เปิด [controller brands list](src/controllers-$id/02-read-brands.js) → service.listBrands → repo.listBrands

โครงนี้ส่งแถว brands ที่ SELECT ไว้โดยตรง หากโจทย์กำหนด DTO ให้เพิ่ม mapper และ `rows.map(...)` ก่อนตอบ รายการว่างมักส่ง [] ตาม contract ไม่ใช่ return null โดยไม่ดูสเปก

### 7.3 Read 2 — รายการแบบ Pagination

เปิด [controller products list](src/controllers-$id/03-read-products.js) route ต้องเรียก queryParser ก่อน handler เพื่อให้มี req.pagination

```text
?page=2&limit=10 → {page:2,limit:10,offset:10}
               → repo.listProducts + repo.countProducts
               → items.map(summary) → metadata → HTTP 200
```

ถ้าโจทย์เพิ่ม filter ให้ส่ง filter ไปทั้ง list และ count ดูส่วน 9 อย่าคิดว่าโครงเดิมรองรับ search/filter แล้วโดยไม่แก้ SQL

### 7.4 Read 3 — รายตัว

เปิด [controller detail](src/controllers-$id/04-read-product-detail.js) → service.getProduct → repo.findProduct → detail

- อ่าน ID จาก req.params.id ไม่ใช่ req.query.id
- numeric ID ต้องตรวจเป็นจำนวนเต็มบวก; string key เช่น NA ห้าม Number()
- ไม่พบแถวให้ service โยน 404 ก่อน mapper
- SELECT ใช้ rows[0] หรือ null ไม่ส่งทั้ง array ถ้าสเปกต้องการ object

### 7.5 Update — แก้ไขข้อมูล

เปิด [controller Update](src/controllers-$id/05-update-product.js) → service.updateProduct → repo.updateProduct

```text
ตรวจ existing → validate body → ตรวจ unique กับแถวอื่น
             → UPDATE WHERE id=? → อ่านกลับ → detail DTO → 200
```

PUT ของโครงนี้รับ full body เหมือน POST หากส่งแค่ name จะไม่ผ่าน validation เมื่อสเปกต้องการ partial update ต้องปรับ validation/การรวมค่า/SQL ด้วย

unique check ต้องอนุญาตค่าเดิมของแถวตัวเอง: `other && other.id !== id` จึงถือว่าชนกับแถวอื่น ไม่ใช้ changedRows=0 ตัดสินว่าไม่พบ เพราะส่งค่าเดิมอาจยังสำเร็จ

### 7.6 Delete — ลบข้อมูล

เปิด [controller Delete](src/controllers-$id/06-delete-product.js) → service.removeProduct → repo.removeProduct

ตรวจ existing/affectedRows ตามโครง ถ้าลบสำเร็จตอบ `res.status(204).end()` ไม่มี JSON; ถ้าโจทย์กำหนด 200 ให้แก้ตาม body ที่ระบุ ไม่ใช้ success helper กับ 204

หากถูก FK อ้างอิง โครงตอบ 409 RESOURCE_IN_USE ไม่ลบตารางลูกหรือปิด FK เองโดยไม่มีข้อกำหนด Composite key ต้องมีทุกส่วนใน WHERE ไม่เช่นนั้นอาจลบหลายคู่พร้อมกัน

คู่มือรายข้อเพิ่มเติมอยู่ใน [guides/operations](guides/operations)

## 8. DTO: แปลงทั้งชื่อ ชนิด และ field ที่เปิดเผย

โครงแยก summary สำหรับ list และ detail สำหรับรายตัว/Create/Update:

| DB entity | Response | เหตุผล |
| --- | --- | --- |
| brand_id | brandId | เปลี่ยนชื่อ |
| brand_name จาก JOIN | brandName เฉพาะ detail | ข้อมูลจากอีกตาราง |
| price อาจเป็น "1250.50" | price: 1250.5 | Number ตาม contract |
| release_date | releaseDate: "YYYY-MM-DD" หรือ null | คงวัน/ชนิดให้ตรง |
| internal_cost | ไม่ส่ง | ไม่อยู่ใน allowlist |

แก้ [product-mapper.js](src/mappers-$id/product-mapper.js) ทั้งสองฟังก์ชันตาม endpoint ที่ใช้ ไม่ return `{...entity}` เพราะคอลัมน์ภายในอาจหลุดออกมา ระวัง `Number(null)` กลายเป็น 0 ถ้า field นั้น nullable ให้แยก null ก่อนตามสเปก

Envelope คือ JSON ชั้นนอก เช่น `{success, data, timestamp}` ต่างจาก DTO ใน data ถ้าเปลี่ยนเป็น `{status, data}` ต้องแก้ทั้ง success helper และ error handler ให้สอดคล้อง ดู [w6-response.js](recipes/w6-response.js)

## 9. Pagination: แก้อะไรบ้างเมื่อสเปกต่างจากโครง

โครงปัจจุบันใช้ page เริ่ม 1, limit เริ่ม 10, cap limit ที่ 100, invalid query → 400, หน้าที่เกินท้าย → 200 + [] และ total จริง

```js
const offset = (page - 1) * limit;
const totalPages = Math.ceil(total / limit);
```

ตัวอย่าง total=23, page=3, limit=10: offset=20, data มีได้ไม่เกิน 3 รายการ, totalPages=3, hasNextPage=false หน้า 4 data=[] แต่ total ยังเป็น 23; ถ้า total=0 totalPages=0

ต้องปรับพร้อมกันสามจุด:

1. pagination middleware: ชื่อ query/default/max/reject หรือ cap
2. repository: LIMIT/OFFSET และ ORDER BY ที่แน่นอน
3. api-response.metadata: ชื่อ key/สูตร/boolean ตาม contract

ถ้ามี `?name=...` ต้องเพิ่ม validation และ filter ใน service/repository **ทั้ง SELECT และ COUNT** โดย bind ค่าผ่าน ? เหมือนกัน COUNT ไม่ใช่ rows.length เพราะ rows คือเฉพาะหน้าปัจจุบัน หากมี JOIN แบบหนึ่งต่อหลายให้นับ resource ที่ต้องการจริง ไม่ปล่อยให้แถวที่ซ้ำจาก JOIN ทำให้ total เกิน

ค่าจาก query เป็น string และ query ซ้ำอาจเป็น array โครงจึงตรวจชนิดก่อนแปลง ไม่ใช้ parseInt('2abc') ซึ่งกลายเป็น 2

## 10. Exception Handling: โยนตรงไหน จับตรงไหน

AppError ใน repo นี้ใช้ลำดับ **message, status, code**:

```js
throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
```

อย่าสลับกับ HttpError(status,message,code) ของ Students project เพราะจะได้ค่า status ผิด

```text
input ผิด → service / middleware → AppError 400
ไม่พบ → service → AppError 404
unique ชน → precheck หรือ DB → 409
DB error ไม่คาดหมาย → 500
                       ↓
             errorHandler หลัง routes → JSON error
```

| MySQL code | HTTP ของโครง | ความหมาย |
| --- | --- | --- |
| ER_DUP_ENTRY (1062) | 409 | PK/UNIQUE ซ้ำ |
| ER_NO_REFERENCED_ROW_2 (1452) | 400 | FK ปลายทางไม่มี |
| ER_ROW_IS_REFERENCED_2 (1451) | 409 | ยังถูกแถวอื่นอ้างอิง |

Express 5 ส่ง Promise rejection จาก async handler ไป error middleware ได้ หากย้ายไป Express 4 ต้องมี async wrapper หรือ try/catch + next(err) และลงทะเบียน handler สี่พารามิเตอร์ `(err,req,res,next)` หลัง routes

ไม่ catch แล้ว return undefined จน request ค้าง และไม่แปลง DB error ทุกชนิดเป็น 409 รายละเอียด SQL/stack/password ไม่ใช่ข้อความตอบ client

## 11. ทดสอบโครงแบบมีลำดับ

ใช้ [catalog.http](requests/catalog.http) ใน editor ที่รองรับ หรือ Postman/curl ที่ติดตั้งไว้ ไม่จำเป็นต้องลง extension ระหว่างสอบ

1. GET /student-info: ตรวจ prefix และ identity ก่อน
2. GET /brands: เลือก brand_id ที่มีจริง
3. POST /products ด้วย body ในส่วน 7.1: ตรวจ 201 แล้วจด `data.id`
4. GET /products/{id ที่จด}: ตรวจ field/type/ค่าที่สร้าง
5. GET /products?page=1&limit=10: ตรวจ summary DTO และ metadata
6. PUT /products/{id ที่จด}: ส่ง full body เปลี่ยน name แล้วอ่านกลับ
7. PUT ค่าเดิมซ้ำ: โครงนี้ต้องยังได้ 200
8. DELETE แถวที่สร้างเอง: 204 และ body ว่าง
9. GET ID เดิม: 404

ตัวอย่างตรวจ endpoint เริ่มต้นจาก Terminal (ใช้รหัส/port จริงของตัวเอง):

```sh
curl -i 'http://127.0.0.1:3000/api/demo001/student-info'
curl -i 'http://127.0.0.1:3000/api/demo001/products?page=2&limit=10'
```

`-i` แสดง HTTP status และ headers อย่าดูแค่ field success ใน JSON เครื่องมือ `.http` ไม่แทน `{id}` ให้อัตโนมัติ ต้องใส่ค่าที่ได้รับหรือใช้ตัวแปรของเครื่องมือตามตัวอย่างไฟล์

ตรวจ negative cases เพิ่ม: body ขาด required, number ส่งเป็น string, ID ผิดชนิด, ID ไม่มี, SKU ซ้ำ, FK ไม่มี, page=0, page=abc, limit=0 และ query ซ้ำ ตรวจผลตามสเปกของคุณ ไม่ยึดค่าตัวอย่างเมื่อโจทย์ต่างออกไป

หลัง POST/PUT ตรวจแถวใน DB ด้วย key ของแถวที่สร้าง เพื่อยืนยันว่าไม่ใช่แค่ response ดูถูกต้อง ส่วน `npm test` ใช้กับ schema ฝึกเดิม ตรวจให้โครงเดิมผ่านได้ แต่ไม่ยืนยันว่าโค้ดที่เปลี่ยน schema แล้วตรงข้อสอบ

## 12. เปิดไม่ติด / ผลไม่ตรง เริ่มดูตรงไหน

| อาการ | ตรวจ / วิธีแก้ |
| --- | --- |
| npm หา package.json ไม่เจอ | cd เข้าโฟลเดอร์ที่มีไฟล์จริง |
| ERR_MODULE_NOT_FOUND | npm ci ก่อนตัดเน็ต; ตรวจ import path และ .js |
| ECONNREFUSED | เปิด MySQL, ตรวจ host/DB_PORT |
| ACCESS_DENIED | ตรวจ DB_USER/DB_PASSWORD ใน .env |
| EADDRINUSE | หยุด server เดิมด้วย Ctrl+C หรือเปลี่ยน PORT แล้วแก้ base URL |
| 404 ทุก endpoint | ตรวจ method, prefix STUDENT_ID, resource path, port |
| req.body undefined | Content-Type application/json และ express.json ก่อน router |
| ER_BAD_FIELD_ERROR / NO_SUCH_TABLE | แก้ SQL ให้ตรง schema ที่เชื่อมต่ออยู่ |
| ER_BAD_NULL_ERROR | required/default/allowlist ไม่ครบตาม NOT NULL |
| DTO field หาย | SQL alias และ mapper ใช้ชื่อเดียวกันหรือไม่ |
| totalPages ไม่ตรง | COUNT และ filter ตรงกันไหม ใช้ limit หลัง cap หรือยัง |
| เปลี่ยนโค้ดแล้วเหมือนเดิม | หยุด npm start แล้วเริ่มใหม่ โครงไม่ได้เปิด watch mode |

ใช้ stack trace ใน Terminal หาชื่อไฟล์และบรรทัดของเรา แล้วแก้ที่ layer นั้น ไม่แก้ status ให้ผ่านโดยไม่ตรวจว่าฐานข้อมูลทำงานถูก

## 13. นำไปใส่ template อาจารย์

อ่าน [แผนที่ย้ายไฟล์](guides/05-template.md) คง package/dependencies/ชื่อ folder/รูปแบบส่งตามคำสั่ง ไม่ทับ package.json ทั้งไฟล์เพียงเพื่อเพิ่ม scripts.start

- ย้าย repository/service/mapper ที่ใช้จริง และประกอบ route/controller
- ย้าย middleware/config ที่ source import ใช้ให้ครบ
- ถ้าเปลี่ยน `-$id` เป็นรหัสตัวเอง ต้องแก้ import ทุกแห่งด้วย
- คง entrypoint ที่ start command เรียกจริง
- เอกสาร/tests/scripts/SQL ตัวอย่างไม่จำเป็นต้องส่งทั้งหมด
- ใช้ runner ของอาจารย์และ assertion จากสเปกจริง ตรวจ method/status/body ให้ตรง

`verify:template` ในชุดนี้ตรวจการประกอบโครงตัวอย่างลงสำเนา ZIP ไม่ใช่คำสั่งแก้ข้อสอบให้อัตโนมัติ และไม่ยืนยัน schema ใหม่ทุกกรณี

## 14. ก่อนตัดเน็ตและก่อนส่ง

ตามประกาศ ใช้เอกสาร hard/soft copy ได้ในภาคปฏิบัติ เตรียมดาวน์โหลดตามช่วง 15 นาทีก่อนสอบที่อนุญาต ระหว่างสอบห้ามต่ออินเทอร์เน็ต และรับ/ส่งผ่าน LEB2

- เปิดเอกสารนี้และ source ได้จากไฟล์ในเครื่อง
- เตรียม Node/MySQL/dependencies และเครื่องมือ request ที่ใช้ได้แบบ offline
- ลองตัดเน็ตแล้ว npm start และเรียก endpoint ได้จริง
- ตรวจ identity, DB, method/path, required fields, DTO และ error contract
- หยุด server แล้วเริ่มใหม่หนึ่งครั้ง เพื่อจับ import/config ที่ยังผิด
- ตรวจไฟล์ส่งตามคำสั่งอาจารย์ และบัญชี LEB2 พร้อมใช้งาน

ใช้ [สรุป 9 บท](INT161-MIDTERM) เมื่อต้องทบทวนแนวคิด และ [offline/debug guide](guides/06-offline.md) เมื่อต้องค้นอาการระหว่างปรับโครง
