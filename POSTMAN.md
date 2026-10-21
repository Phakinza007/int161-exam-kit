# Postman — เชื่อม localhost และตรวจ API ทีละขั้น

ใช้คู่มือนี้กับ **int161-exam-kit แบบ products/brands** หน้าเอกสารที่ port 8171 กับ API ที่ port 3000 เป็นคนละ server: Postman ต้องส่งไป **3000** ตาม PORT ใน .env ไม่ใช่ port เอกสาร

## 1. เปิดทั้งคู่ก่อน

Terminal แรก เปิดหน้าเอกสาร:

```sh
npm run study
```

เปิด http://127.0.0.1:8171 ใน browser ส่วน Terminal ที่สองเปิด API จาก folder เดียวกัน:

```sh
npm start
```

ก่อนเปิด API ต้องตั้ง .env และเตรียม MySQL ตาม [START-HERE](START-HERE.th.md) ถ้าใช้ฐานตัวอย่างครั้งแรกให้ใช้ DB_MODE=practice แล้ว npm run db:init ไว้ก่อน ส่วนฐานสอบใช้ SQL อาจารย์ ไม่ใช้ db:init

เมื่อ npm start แสดง Template API ให้เปิด Postman **desktop app** ที่ติดตั้งไว้ในเครื่อง การส่ง HTTP ไป localhost ไม่ต้องใช้อินเทอร์เน็ต แต่ต้องให้ Node server และ MySQL ยังทำงานอยู่

## 2. เตรียมใช้งาน offline ให้ตรงโหมด

Postman มี lightweight API Client สำหรับส่ง request แบบออฟไลน์โดยไม่ลงชื่อเข้าใช้ และ workspace สำหรับ collections/variables ความสามารถสองโหมดต่างกัน ให้ทดลองบนเครื่องสอบก่อนตัดเน็ต อย่าสมมติว่า collection/variables ใช้ได้ในทุกโหมด

[เอกสาร Postman: Lightweight API Client](https://learning.postman.com/latest-v-12/docs/getting-started/basics/using-api-client)

วิธีด้านล่างแยกสองทาง: ถ้ามี Import/Collections ใช้ส่วน 3; ถ้าใช้ lightweight หรือไม่มี variables ให้ใช้ URL เต็มและสร้าง request ตามส่วน 4 ไม่ต้องลงชื่อเข้าใช้เพื่อทำตามวิธี URL เต็ม

## 3. Import collection ที่เตรียมให้

ทำขั้นนี้ในช่วงเตรียมเครื่องและตรวจว่าเปิดใช้งานแบบ offline ได้จริง:

1. เลือก Import ใน Postman แล้วเลือกไฟล์ [requests/postman.json](requests/postman.json) จากเครื่อง ไม่ต้อง import ผ่านลิงก์ออนไลน์
2. เปิด collection “INT161 local practice — run in order”
3. เปิด Variables ของ collection ตั้ง baseUrl เป็น `http://127.0.0.1:3000/api/demo001`
4. ถ้าเปลี่ยน STUDENT_ID/PORT ใน .env ให้แก้ baseUrl ตามจริง อย่าเติม /products ที่ท้าย baseUrl เพราะแต่ละ request มี resource ต่อไว้อยู่แล้ว
5. ตรวจว่าไม่มี environment variable ชื่อ baseUrl มาทับค่าของ collection
6. ส่งตามลำดับ 1 Identity → 2 List → 3 Create → 4 Detail → 5 Update → 6 Delete → 7 Confirm gone

Create script บันทึก productId และ createdSku จาก response ให้ request ถัดไปใช้ แถวที่ลบคือ ID ที่สร้างเอง หาก productId ยังเป็น CREATE_FIRST ให้รัน Create ให้ผ่าน 201 ก่อน

กรณีที่เปลี่ยน schema/envelope แล้ว ต้องแก้ body, URL และ script อ่าน `pm.response.json().data` ให้ตรงสเปกใหม่ด้วย collection ตัวอย่างไม่ได้ปรับตามโค้ดที่คุณแก้ให้อัตโนมัติ

[เอกสาร Postman: Import data](https://learning.postman.com/v11/docs/getting-started/importing-and-exporting/importing-data)

## 4. สร้าง request เองด้วย URL เต็ม

วิธีนี้ไม่ต้องพึ่ง collection variables ใช้ได้เมื่อสร้าง HTTP request ใน desktop client ได้แล้ว ปุ่ม/ตำแหน่งเมนูอาจต่างตามรุ่น เลือก New → HTTP request หรือเปิดแท็บ request ใหม่

### 4.1 ตรวจการเชื่อมต่อก่อน — GET Identity

- Method: GET
- URL: `http://127.0.0.1:3000/api/demo001/student-info`
- ไม่ใส่ Body
- กด Send

คาดหวัง 200 และ data.studentId เป็น demo001 ตาม config ถ้า 404 ให้ตรวจ prefix/รหัสนักศึกษา ถ้า connection refused ให้ตรวจ npm start ก่อน ไม่ใช่ไปแก้ SQL

Postman เชื่อมกับ HTTP server ของ Node ไม่ใช่ต่อ MySQL ตรง ๆ จึงไม่ใส่ DB_PORT=3306 หรือ password MySQL ใน URL/request นี้

### 4.2 R1 — GET Brands list

URL: `http://127.0.0.1:3000/api/demo001/brands`, Method GET

คาดหวัง 200, data เป็น array ดู id ของ brand ที่มีจริงเพื่อใช้ใน POST (ข้อมูลตัวอย่างมี brand id 1)

### 4.3 C1 — POST Create

Method POST, URL `http://127.0.0.1:3000/api/demo001/products`

เลือก **Body → raw → JSON** แล้ววาง:

```json
{
  "sku": "POSTMAN-MANUAL-001",
  "name": "My Phone",
  "brand_id": 1,
  "category": "PHONE",
  "price": 1200.5,
  "ram_gb": 8,
  "storage_gb": 128,
  "color": "Black"
}
```

ตรวจ Headers ว่ามี Content-Type: application/json กด Send → คาดหวัง **201** จด data.id ที่ได้จริง เช่น 24 ห้ามสมมติว่าเป็น 1 หากส่ง SKU เดิมซ้ำได้ 409 ให้เปลี่ยน SKU สำหรับแถวใหม่

Body นี้เป็น field ขั้นต่ำของตัวอย่าง ข้อสอบจริงอาจกำหนด field ต่างกัน ดู [GUIDE](GUIDE.md) ก่อนปรับ

### 4.4 R2 — GET Products + Pagination

Method GET, URL `http://127.0.0.1:3000/api/demo001/products`

ใน Params เพิ่ม:

| Key | Value |
| --- | --- |
| page | 1 |
| limit | 10 |

หรือวาง `http://127.0.0.1:3000/api/demo001/products?page=1&limit=10` โดยตรง ใช้แบบใดแบบหนึ่ง ไม่เพิ่ม key ซ้ำสองรอบ คาดหวัง 200, data เป็น summary DTO array และ pagination.total เป็นจำนวนทั้งหมด

### 4.5 R3 — GET Detail

Method GET, URL ตัวอย่างถ้า Create ได้ id 24:

```text
http://127.0.0.1:3000/api/demo001/products/24
```

แทน 24 ด้วย ID ของคุณ คาดหวัง 200 และ detail DTO มี brandName, price เป็น number พร้อม field ตาม mapper ไม่มี internal_cost

### 4.6 U1 — PUT Update

Method PUT, URL เดิมที่ลงท้ายด้วย ID ของคุณ เลือก Body → raw → JSON แล้วส่ง full body:

```json
{
  "sku": "POSTMAN-MANUAL-001",
  "name": "My Phone Updated",
  "brand_id": 1,
  "category": "PHONE",
  "price": 0,
  "ram_gb": 8,
  "storage_gb": 128,
  "color": "Blue"
}
```

ใช้ SKU ของแถวเดิม คาดหวัง 200 GET ID เดิมอีกครั้งต้องเห็นค่าที่แก้ ส่งค่าเดิมซ้ำยังได้ 200 โครงนี้ไม่รับ PUT แค่ name เพราะ validation ต้องการ full body

### 4.7 D1 — DELETE และตรวจหลังลบ

Method DELETE, URL ลงท้าย ID ที่คุณสร้าง คาดหวัง **204 และ Body ว่าง** หลังจากนั้นเปลี่ยนเป็น GET URL เดิมแล้ว Send ควรได้ 404

ไม่เลือก brand id หรือ product id อื่นที่ไม่ได้ตั้งใจลบ ถ้าแถวยังมี FK อ้างอิงอาจได้ 409 ตาม contract

## 5. อ่านผลให้ครบ ไม่ดูแค่สีเขียว

- Status คือ HTTP status จริงจาก Postman ไม่ใช่เลขที่เขียนไว้ใน JSON
- Body: ตรวจชื่อ key/ชนิด/array vs object/DTO/pagination
- Headers: JSON ควรมี Content-Type ที่ตรง
- เปลี่ยนข้อมูลแล้ว GET อีกครั้ง และตรวจแถวใน DB ด้วย key เพื่อยืนยัน persistence
- Response 204 ต้องไม่มี Body; response 404/409 ต้องตรง error envelope ที่โจทย์กำหนด

ลองส่ง page=0, ID ที่ไม่มี, ขาด required field และ SKU ซ้ำ เพื่อยืนยัน 400/404/409 ของโครงนี้ ก่อนแก้ตามสเปกจริง

## 6. ปัญหาที่พบบ่อย

| อาการ | วิธีตรวจ |
| --- | --- |
| Could not send / ECONNREFUSED | npm start ยังทำงานอยู่ไหม, PORT ถูกไหม |
| ได้หน้าเอกสารแทน API | ใช้ 3000 ไม่ใช่ 8171 |
| 404 ทุก request | prefix /api/STUDENT_ID และ resource ถูกไหม |
| URL ยังมี {{baseUrl}} สีเตือน | variable ไม่ถูก resolve; ตั้งใน collection หรือใช้ URL เต็ม |
| productId=CREATE_FIRST | Create ต้องผ่านก่อน หรือใส่ ID เอง |
| 400 INVALID_JSON | raw body มี comma/quote ผิด หรือใช้ JS object แทน JSON |
| 400 required fields | PUT ต้อง full body; field/type ตรง schema หรือไม่ |
| 409 DUPLICATE_KEY | SKU ชนแถวอื่น ใช้ SKU ใหม่หรือตรวจ ID ที่แก้ |
| 500 | ดู Terminal Node และ config/SQL ไม่แก้ status หลอกให้ผ่าน |

## 7. ก่อนสอบ

เตรียม desktop app, Node, dependencies, MySQL และไฟล์ request/คู่มือให้พร้อมในช่วงที่อนุญาต ลองตัดอินเทอร์เน็ตแล้วเปิด localhost และส่ง request จริง หาก collection ใช้ไม่ได้ในโหมดที่เลือก ให้ใช้วิธี URL เต็มด้านบน พร้อม body ที่คัดลอกจากคู่มือ ไม่ต้องโหลดอะไรเพิ่มระหว่างสอบ
