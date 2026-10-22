# INT161 — Template ตามโครงอาจารย์ + คู่มือ Offline

โค้ด CRUD, DTO, Pagination และ Exception Handling สำหรับเปิดเทียบขณะทำข้อสอบ **ตั้งชื่อไฟล์หลักตาม midterm-exam-esm-template.zip แล้ว** HTTP handler อยู่ใน route.js ไม่แยก Controller และเปิด server จาก app.js

เริ่มที่ [START-HERE](START-HERE.th.md) → [แผนที่ไฟล์อาจารย์](guides/00-template-map.md) → [GUIDE แบบละเอียด](GUIDE.md)

```text
src/
├── app.js
├── test-service.js
├── configs-$id/db-config.js
├── routes-$id/route.js
├── services-$id/service.js
├── repositories-$id/repository.js
├── mappers-$id/api-response.js
├── mappers-$id/entity-dto-mapper.js
└── middlewares-$id/pagination-middleware.js
```

ลำดับทำงาน: Request → route.js (req/res) → service.js → repository.js → MySQL แล้ว Service เรียก EntityDtoMapper.map/maps ก่อน route.js ส่ง apiResponse

## ทำตามทีละขั้น

มีคู่มือ6บทพร้อม Self-check ใน localhost: [00เตรียมตัว](START-HERE.th.md) → [01WebStorm](guides/walkthrough/01-webstorm.md) → [02Database](guides/walkthrough/02-database.md) → [03CRUD](guides/walkthrough/03-crud.md) → [04DTO/Pagination/Error](guides/walkthrough/04-contracts.md) → [05Postman/Offline](guides/walkthrough/05-postman-offline.md) ทุกขั้นระบุไฟล์ที่เปิด สิ่งที่ทำ เหตุผล ผลที่ควรเห็น และวิธีตรวจเมื่อไม่ผ่าน

## เปิดใช้งาน

เตรียม Node >=22.9, MySQL และ dependencies ในช่วงที่ใช้อินเทอร์เน็ตได้:

```sh
npm ci
cp .env.example .env
```

แก้ข้อมูลเชื่อมต่อใน .env ถ้าเปิดตัวอย่างฝึกใช้ DB_MODE=practice แล้ว npm run db:init จากนั้นเปิดคนละ Terminal:

```sh
npm run study   # คู่มือ http://127.0.0.1:8171
npm start       # API http://127.0.0.1:3000/api/demo001
```

หน้า localhost มี Overall Diagram (`#overall`) เลือก C1/R1/R2/R3/U1/D1 และกรณี400/404/409 แล้วไล่ขั้น ดูไฟล์/โค้ด/SQL/ข้อมูลเข้า-ออก พร้อมเน้นจุดINSERT/UPDATE/DELETEจริง แผนภาพเป็นข้อมูลจำลอง ไม่เรียกAPIหรือเปลี่ยนDB

หน้า localhost แบ่ง 6 หมวด มีค้นหา สารบัญ สีโค้ดแยกภาษา และ Diagram กดเปิดไฟล์จริงได้ อ่าน [Postman](POSTMAN.md) สำหรับ Import collection และวิธีส่ง URL เต็มแบบ offline

## เลือกงานที่กำลังทำ

| งาน | โค้ด req/res อยู่ในไฟล์เดียวกัน | คู่มือ + คำถาม + เฉลย |
| --- | --- | --- |
| C1 สร้างสินค้า | [route.js](src/routes-$id/route.js) POST | [Create](guides/operations/01-create-product.md) |
| R1 รายการแบรนด์ | [route.js](src/routes-$id/route.js) GET /brands | [Read list](guides/operations/02-read-brands.md) |
| R2 รายการ + Pagination | [route.js](src/routes-$id/route.js) GET /products | [Pagination](guides/operations/03-read-products.md) |
| R3 รายละเอียด | [route.js](src/routes-$id/route.js) GET /products/:id | [Read detail](guides/operations/04-read-product-detail.md) |
| U1 แก้ไข | [route.js](src/routes-$id/route.js) PUT | [Update](guides/operations/05-update-product.md) |
| D1 ลบ | [route.js](src/routes-$id/route.js) DELETE | [Delete](guides/operations/06-delete-product.md) |

ดู [คำถามและวิธีคิดรวม](QUESTIONS-AND-ANSWERS.md) และ [สรุป 9 บท](INT161-MIDTERM) สำหรับอ่านประกอบ ไม่มีโฟลเดอร์โจทย์ใหม่ให้ทำเพิ่ม

## ส่วนที่เพิ่มจาก ZIP อาจารย์

- settings.js/database-mode.js สำหรับ .env และแยก practice/exam
- app-error.js/error-handler.js สำหรับ error contract
- factories สำหรับทดสอบแยกฐาน ไม่ได้แยก HTTP handler ไปอีก layer
- schema products/brands, tags/composite key, validation, timestamp และ pagination policy ของตัวอย่าง ต้องแก้ตามสเปกสอบจริง
- local-study, guides, tests, scripts และ requests เป็นเครื่องมืออ้างอิง ไม่ต้องส่งทั้งหมด

ชื่อไฟล์/ฟังก์ชันตรง template แต่ไม่ได้คัดลอก placeholder หรือบั๊กเดิมทุกบรรทัด รายละเอียดความต่างอยู่ใน [แผนที่ไฟล์](guides/00-template-map.md)

## ฐานสอบและการส่งงาน

DB_MODE=exam บังคับ DB_NAME/STUDENT_ID/STUDENT_NAME/STUDENT_KEY จริงครบ ไม่สร้าง/resetฐาน ใช้ SQL อาจารย์และปรับ schema/body/DTO/path/status ก่อนทดสอบ ไม่ใช้ db:init หรือชุดทดสอบฐานฝึกกับฐานสอบ

[ใส่ลง teacher template](guides/05-template.md) · [Debug/Offline/ก่อนส่ง](guides/06-offline.md) · [ผลตรวจ](docs/VALIDATION.md)
