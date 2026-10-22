# บท 02 — ต่อ MySQL และเห็นข้อมูลก่อนเขียน API

บทนี้ใช้ฐานฝึก int161_practice_catalog ไม่ใช้ sakila และไม่ใช้ฐานสอบจริง เป้าหมายคือทดสอบแยกสามจุด: Database tool ต่อได้, Node ต่อได้ และ SQL อ่านข้อมูลได้

## ขั้นที่ 1 — ตั้งค่าที่เดียวใน .env

**ทำที่ไหน:** Project → .env

**ทำอะไร:** ใส่ค่าของเครื่องตัวเอง โดยตัวอย่างนี้ใช้:

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

**ทำไม:** db-config.js สร้าง pool โดยอ่าน config ที่ settings.js โหลดจาก environment ไม่ต้องใส่รหัสผ่านจริงลง source

**ควรเห็น:** DB_PORT กับ PORT ไม่สลับกัน DB_PASSWORD เป็นรหัส MySQL ของคุณ ไม่ใช่รหัสผ่าน WebStorm/GitHub/LEB2 ชื่อ DB_MODE เป็น practice เมื่อลองตัวอย่าง

**ถ้าไม่ผ่าน:** หากไม่ทราบรหัสผ่านให้ตรวจบัญชี MySQL ที่เครื่องใช้ก่อน ไม่ reset หรือเปลี่ยนบัญชีเดาสุ่มจากคู่มือ การใส่ .env อย่างเดียวไม่สร้างฐานหรือตาราง

## ขั้นที่ 2 — สร้างเฉพาะฐานฝึก

**ทำที่ไหน:** Terminal อีกแท็บจาก npm run study

```sh
npm run db:init
```

**ทำไม:** โครงสร้างตัวอย่างอยู่ sql/schema.sql และ script เติม brands/products สำหรับลอง API คำสั่งนี้เป็นของชุดอ้างอิง ไม่ใช่คำสั่งที่อาจารย์บังคับใช้กับฐานสอบ

**ควรเห็น:** คำสั่งจบสำเร็จ แล้วใน MySQL มีฐาน int161_practice_catalog กับตาราง brands, products, tags, product_tags และ marker ของชุดนี้

**ถ้าไม่ผ่าน:** ECONNREFUSED = MySQL/host/port; ACCESS_DENIED = user/password; ถ้าฐานชื่อเดียวกันมีแต่ไม่มี marker ให้เลือกชื่อฐานฝึกใหม่ที่ขึ้นต้น int161_practice_ ไม่เติม marker ลงฐานที่ไม่รู้ที่มา ไม่ใช้คำสั่งนี้ใน DB_MODE=exam

## ขั้นที่ 3 — สร้าง MySQL Data Source ใน WebStorm

**ทำที่ไหน:** View → Tool Windows → Database แล้วกด + → Data Source → MySQL หากไม่พบเครื่องมือ Database ในรุ่นที่ติดตั้ง ให้ใช้ MySQL client ที่มีอยู่และตรวจด้วย doctor ในขั้น 4 แทน

**ทำอะไร:** Host=127.0.0.1, Port=3306, User/Password ตรง .env, Database=int161_practice_catalog ถ้ามี Download missing driver files ให้เตรียม driver ตอนยังใช้อินเทอร์เน็ตได้ จากนั้น Test Connection → OK

**ทำไม:** Data Source เป็น connection ของ IDE แยกจาก mysql2 ใน Node การตั้ง IDE ไม่ได้แก้ .env และการตั้ง .env ไม่ได้สร้าง IDE Data Source

**ควรเห็น:** Test Connection ผ่านและแสดง tables ของฐานที่เลือก ถ้าต่อผ่านแต่ไม่เห็นตารางให้เลือก schema/refresh ใน Database tool

**ถ้าไม่ผ่าน:** ตรวจ driver, MySQL service, user/password และ port ให้ตรง อย่าเปลี่ยน port API3000 มาใส่ช่อง MySQL

[อ้างอิงตั้ง MySQL Data Source ของ JetBrains](https://www.jetbrains.com/help/webstorm/mysql.html)

## ขั้นที่ 4 — ตรวจว่า Node ต่อได้จริง

**ทำที่ไหน:** Terminal ใน project root

```sh
npm run doctor
```

**ควรเห็น:** Dependency OK, MySQL version และ SELECT1 ผ่าน คำสั่งนี้อ่านอย่างเดียว ไม่ยืนยันว่า SQL ทุก endpoint หรือ schema ใหม่ถูกทั้งหมด

**ถ้าไม่ผ่าน:** ถ้า IDE Test Connection ผ่านแต่ doctor ไม่ผ่าน ให้เทียบ .env กับ IDE เพราะเป็นคนละ connection และตรวจว่าเปิด Terminal อยู่ project เดียวกัน

## ขั้นที่ 5 — อ่าน schema และข้อมูล

**ทำที่ไหน:** Database tool → Data Source → New Query Console หรือ MySQL client ของคุณ

```sql
SELECT id, name FROM int161_practice_catalog.brands ORDER BY id;
SELECT id, sku, name, brand_id, price
FROM int161_practice_catalog.products ORDER BY id LIMIT 5;
```

**ทำไม:** รู้ชื่อ PK/columns จริงก่อนเปลี่ยน SQL ไม่สมมติว่าทุกตารางมี id เช่น sakila.country ใช้ country_id ซึ่งเป็นอีก schema หนึ่ง

**ควรเห็น:** brands/products มีแถวและ brand_id ชี้ไปยัง brands.id หลัง db:init ฐานฝึกเริ่มต้นมีตัวอย่างสินค้า 23 แถว จำนวนปัจจุบันอาจต่างหากเคยเพิ่ม/ลบแล้ว ไม่ต้องแก้ฐานให้กลับเท่าเดิมเพื่อให้เหมือนภาพ

**ถ้าไม่ผ่าน:** Unknown table/column ให้ดู DB_NAME และ schema ที่ query อยู่ก่อนแก้ code

## ขั้นที่ 6 — เปิด API

```sh
npm start
```

**ควรเห็น:** Template API พร้อม http://127.0.0.1:3000/api/demo001 และ process ยังทำงานอยู่ ลอง GET /student-info และ /products?page=1&limit=10 ด้วย Browser/Postman

**ถ้าไม่ผ่าน:** ถ้าเห็น identity แต่ products500 แปลว่า HTTP server ทำงาน แต่ SQL/schema ยังมีปัญหา ถ้า EADDRINUSE ให้หยุด API ตัวเดิมที่ตัวเองเปิด แล้วเริ่มใหม่ การแก้ .env/source ต้อง restart

## ใช้ฐานอาจารย์เมื่อไร

หลังอ่านสเปกและปรับ SQL/body/DTO แล้วจึงตั้ง DB_MODE=exam, DB_NAME และ identity จริงครบ ใช้ SQL อาจารย์ตามคำสั่ง ไม่รัน db:init/tests ของฐานฝึกกับฐานสอบ ถ้าเปลี่ยนเป็น sakila เพียงแก้ DB_NAME ยังไม่พอ เพราะ repository ของชุดนี้ query products/brands

## Self-check

- สร้างฐานฝึกถูกชื่อและเห็น schema
- Data Source ผ่าน หรือใช้ MySQL client อ่านข้อมูลได้
- doctor ผ่านและเข้าใจว่าไม่ได้ตรวจทุก endpoint
- API เปิดได้ และรู้ว่าต้อง restart หลังแก้โค้ด

[บท 01](01-webstorm.md) · [บท 03 — ไล่ CRUD ทีละไฟล์](03-crud.md)
