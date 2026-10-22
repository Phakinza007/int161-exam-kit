# บท 00 — เริ่มตรงนี้: จากโครงเปล่าถึง API ที่ทดสอบได้

อ่านตามลำดับ 6 บทได้โดยไม่ต้องเดาว่าควรเปิดไฟล์ไหนก่อน คู่มือนี้ใช้ **int161-exam-kit รุ่น 3 ตามชื่อไฟล์ใน ZIP สอบกลางภาค** ส่วน schema products/brands เป็นตัวอย่างที่เพิ่ม ไม่ใช่โจทย์จริงทั้งหมด

## ปลายทางที่ควรได้

- เปิดโปรเจกต์ใน WebStorm และรู้ว่า package.json/src อยู่ตรงไหน
- ต่อ MySQL ผ่านทั้งโปรแกรมและ Database tool ของ WebStorm
- อ่านโค้ดครบ Request → route.js → service.js → repository.js → MySQL
- ทดสอบ 1 Create, 3 Read, 1 Update, 1 Delete ด้วย Postman
- รู้จุดแก้ DTO, Pagination และ Exception Handling ตามสเปก
- เปิดคู่มือและ API หลังตัดอินเทอร์เน็ตได้

ช่อง “ตรวจแล้ว” บนเว็บใช้จดความพร้อมของตัวเอง ไม่ได้แปลว่าโปรแกรมตรวจโค้ดผ่านให้อัตโนมัติ

## เตรียม 4 อย่างก่อนเริ่ม

| โปรแกรม | ใช้ทำอะไร | วิธีตรวจ |
| --- | --- | --- |
| WebStorm หรือ editor ที่ใช้คล่อง | เปิด source/Terminal และแก้ไฟล์ | เปิดโปรเจกต์ได้ |
| Node.js >=22.9 และ npm | รัน API/คู่มือ ติดตั้ง dependencies | node -v และ npm -v |
| MySQL Server | เก็บข้อมูลตัวอย่าง | เปิด service และรู้ user/password |
| Postman desktop | ส่ง HTTP request | เปิดแอป สร้าง HTTP request ได้ |

ชุดนี้กำหนด Node >=22.9 เพราะ start script ใช้ --env-file-if-exists ไม่ใช่การบอกว่า Express 5 ทุกรุ่นต้องใช้ Node เวอร์ชันนี้

## ขั้นที่ 1 — ตรวจ Terminal

**ทำที่ไหน:** Terminal ของเครื่อง หรือ View → Tool Windows → Terminal ใน WebStorm

**ทำอะไร:** พิมพ์สองคำสั่งแยกบรรทัด:

```sh
node -v
npm -v
```

**ทำไม:** ตรวจว่าตัวรันและตัวติดตั้ง package พร้อม ก่อนแก้โค้ด

**ควรเห็น:** แต่ละคำสั่งคืนเลขเวอร์ชัน ไม่ใช่ command not found โดย Node ต้องตรงข้อกำหนดด้านบน

**ถ้าไม่ผ่าน:** ตรวจการติดตั้ง Node/PATH แล้วเปิด Terminal ใหม่ การเปิด WebStorm ได้อย่างเดียวไม่ได้ยืนยันว่ามี Node

## ขั้นที่ 2 — แยก port กับฐานข้อมูลให้ถูก

| สิ่งที่เปิด | Address ตัวอย่าง | ใครใช้ |
| --- | --- | --- |
| Study Desk | http://127.0.0.1:8171 | Browser อ่านคู่มือ |
| Express API | http://127.0.0.1:3000/api/demo001 | Postman ส่ง request |
| MySQL | 127.0.0.1:3306 | mysql2 และ Database tool |

**ทำที่ไหน:** ดู .env ของโปรเจกต์

**ทำอะไร:** แยก PORT ของ API ออกจาก DB_PORT ของ MySQL และจด STUDENT_ID ที่เป็น prefix

**ควรเห็น:** อธิบายได้ว่า Postman ต้องไป port3000 ไม่ใช่ 8171 หรือ 3306 และ demo001 เป็นค่าตัวอย่างที่เปลี่ยนตามรหัสตัวเองได้

**ถ้าไม่ผ่าน:** เปิด Diagram แท็บ “เปิดโปรเจกต์” ด้านบนแล้วไล่กล่อง Postman → Node → MySQL

## ขั้นที่ 3 — รู้ขอบเขตตัวอย่างก่อนเขียน

**ทำที่ไหน:** เปิด [แผนที่ไฟล์ ZIP](guides/00-template-map.md)

**ทำอะไร:** ตรวจว่าพบ app.js, route.js, service.js, repository.js, entity-dto-mapper.js, api-response.js และ pagination-middleware.js

**ควรเห็น:** route.js รับ req/res เอง ไม่มี Controller แยก app.js เปิด port ฟังก์ชันใช้ชื่อ getObject/getAllObjects/createObject/updateObject/removeObject ตาม template

**ถ้าไม่ผ่าน:** อาจเปิดรุ่นเก่าที่มี catalog-* หรือ server.js ให้ใช้ชุดรุ่น 3 ขึ้นไป ถ้ากำลังเปิด ZIP อาจารย์ดิบยังไม่ใช่โครงเฉลยพร้อมรัน ให้อ่านบท 01 เรื่องสองโฟลเดอร์ก่อน

## เส้นทางอ่าน 6 บท

| บท | ลงมือทำอะไร | ผ่านเมื่อ |
| --- | --- | --- |
| 00 หน้านี้ | เตรียมโปรแกรม/เข้าใจ port | node/npm พร้อมและรู้แต่ละ server |
| [01 WebStorm](guides/walkthrough/01-webstorm.md) | เปิดโครงและติดตั้ง dependencies | เห็น package.json/src และ npm ci ผ่าน |
| [02 Database](guides/walkthrough/02-database.md) | ตั้ง .env, สร้างฐานฝึก, Test Connection | doctor ผ่านและ SELECT ข้อมูลได้ |
| [03 CRUD](guides/walkthrough/03-crud.md) | ไล่โค้ดและทดสอบทีละ layer | ชี้จุดแก้ครบ 6 งานได้ |
| [04 DTO/Pagination/Error](guides/walkthrough/04-contracts.md) | ตรวจ response และกรณีผิดพลาด | array/object/types/status ตรง |
| [05 Postman/Offline](guides/walkthrough/05-postman-offline.md) | ทดสอบทั้งระบบและเตรียมส่ง | Create→Read→Update→Delete ผ่าน |

## Self-check ก่อนบทถัดไป

- node -v/npm -v ออกเลขเวอร์ชัน
- MySQL เปิดและมี user/password ของตัวเอง
- แยก localhost8171, API3000 และ MySQL3306 ได้
- เข้าใจว่าทุกชื่อ table/body/DTO ต้องปรับตามข้อสอบจริง

พร้อมแล้วเปิด [บท 01 — ใช้ template ใน WebStorm](guides/walkthrough/01-webstorm.md)
