# INT161 Exam Template

ดาวน์โหลดแล้วใช้เป็นโครงช่วยทำข้อสอบ: มีโค้ด CRUD, DTO, Pagination และ Exception Handling ที่ประกอบและรันได้แล้ว พร้อมคอมเมนต์ `ADAPT` บอกจุดที่ต้องเปลี่ยนตามโจทย์

เริ่มที่ [START-HERE.th.md](START-HERE.th.md) เพื่อเปิดโครง แล้วใช้ [GUIDE.md](GUIDE.md) ระหว่างแก้ข้อสอบ

```text
src/
  app.js / server.js       ประกอบ API และเปิด port
  configs-$id/             DB, mode, identity
  routes-$id/              method/path/middleware
  controllers-$id/         req/res แยกตาม CRUD + 3 Read
  services-$id/            validation และ business rules
  repositories-$id/        SQL, PK/FK, JOIN, COUNT
  mappers-$id/             DTO และ response envelope
  middlewares-$id/         pagination/error handling
sql/                       schema ของฐานตัวอย่าง
requests/                  request สำหรับตรวจ API
GUIDE.md                   วิธีปรับโครงให้ตรงโจทย์ที่ได้รับ
INT161-MIDTERM/             สรุปอ่านประกอบ 9 บท
```

## Localhost สำหรับเปิดคู่มือขณะเขียนโค้ด

รัน `npm run study` แล้วเปิด http://127.0.0.1:8171 แบ่ง 6 หมวด: เริ่มใช้งาน, งานปฏิบัติ, เนื้อหาอ้างอิง, Postman, Debug และ source ตาม Layer มีสารบัญในเอกสารและลิงก์คู่มือไปยังโค้ดที่เกี่ยวข้อง พร้อมค้นหาและคัดลอกโค้ด ใช้ได้ offline ไม่ต้องต่อฐานข้อมูลสำหรับหน้าเอกสาร ส่วน API ให้เปิดอีก Terminal ด้วย `npm start` ที่ port 3000

อ่าน [วิธีเชื่อม Postman แบบละเอียด](POSTMAN.md) มีทั้ง Import collection และสร้าง request ด้วย URL เต็มสำหรับโหมด offline

## คำถาม เฉลย วิธีคิด และวิธีทำ

เปิด [QUESTIONS-AND-ANSWERS.md](QUESTIONS-AND-ANSWERS.md) แล้วเลือกส่วนที่ต้องการ แต่ละหน้าจับคู่คำถามเดิมกับJS/SQLที่โครงใช้อยู่และอธิบายเหตุผลทีละขั้น

## เลือกส่วนที่จะใช้

| งาน | โค้ดเริ่มต้น | วิธีปรับ |
| --- | --- | --- |
| Create | [01-create-product.js](src/controllers-$id/01-create-product.js) | [Create guide](guides/operations/01-create-product.md) |
| Read list แบรนด์ | [02-read-brands.js](src/controllers-$id/02-read-brands.js) | [List guide](guides/operations/02-read-brands.md) |
| Read list + Pagination/DTO | [03-read-products.js](src/controllers-$id/03-read-products.js) | [Pagination guide](guides/operations/03-read-products.md) |
| Read detail + JOIN/DTO | [04-read-product-detail.js](src/controllers-$id/04-read-product-detail.js) | [Detail guide](guides/operations/04-read-product-detail.md) |
| Update | [05-update-product.js](src/controllers-$id/05-update-product.js) | [Update guide](guides/operations/05-update-product.md) |
| Delete | [06-delete-product.js](src/controllers-$id/06-delete-product.js) | [Delete guide](guides/operations/06-delete-product.md) |

controllerเรียก service/repository/mapper ที่มีครบในsrc ไม่ต้องประกอบจากโจทย์ฝึกใหม่ products/brands เป็นโครงที่ดัดแปลงจากงานที่เฉลยแล้ว เปลี่ยนชื่อtable/field/keyและcontractตามข้อสอบจริง ส่วนtags/composite key และrecipesเป็นโค้ดทางเลือกที่หยิบใช้หรือลบออกเมื่อไม่เกี่ยวข้อง

## สองโหมด

- `DB_MODE=practice`: เปิดโครงกับฐานตัวอย่างที่แยกไว้ ใช้ `npm run db:init` ได้
- `DB_MODE=exam`: เชื่อม `DB_NAME` ที่ระบุเอง และบังคับ `STUDENT_ID`/`STUDENT_NAME`/`STUDENT_KEY` ให้ครบเป็นค่าจริง ไม่สร้าง/resetฐาน ต้องปรับSQL/schema/contractตามโจทย์และใช้SQLอาจารย์ตามคำสั่ง

เตรียม Node/MySQL และ `npm ci` ก่อนตัดอินเทอร์เน็ต เอกสาร.mdและโค้ด.jsเปิดอ่านออฟไลน์ได้ หรือเปิดหน้าlocalhostด้วยnpm run study ไม่มีโฟลเดอร์โจทย์ให้ทำเพิ่ม

[อ่านสรุป9บท](INT161-MIDTERM) · [ใส่ลงteacher template](guides/05-template.md) · [แก้error/ก่อนส่ง](guides/06-offline.md) · [ผลตรวจ](docs/VALIDATION.md)
