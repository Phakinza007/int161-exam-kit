# CRUD ทีละชั้น

เปิดไฟล์ตามเส้นทางนี้: `src/app.js` → `routes-$id/route.js` → `services-$id/service.js` → `repositories-$id/repository.js` → `mappers-$id/entity-dto-mapper.js`

## Route และ async

`app.js` รับ db pool แล้วประกอบ service/repository ติด router ที่ `/api/${studentId}` โดย studentId เป็นค่าจาก config ตอนเริ่มโปรแกรม `express.json()` ต้องอยู่ก่อน router และ error handler อยู่ท้ายสุด

Express 5 ส่ง rejected Promise ของ async handler ไป error middleware ได้ Express 4 ต้องใช้ try/catch + next(err) หรือ wrapper; ตรวจเวอร์ชันก่อนคัดลอก

## 1C: Create

route รับ req.body → service ตรวจ/allowlist input → ตรวจ SKU ซ้ำ → repository INSERT → ใช้ result.insertId เฉพาะ auto increment numeric key → SELECT ใหม่ด้วย JOIN → detail DTO → 201

DB UNIQUE ยังจำเป็นแม้เช็กก่อน INSERT เพราะ request พร้อมกันอาจผ่าน precheck ทั้งคู่ ห้ามใช้ `SELECT MAX(id)` หาว่าตนสร้างแถวไหน

## 3R: Read

- รายการ brands: SELECT list ตามลำดับแน่นอน
- รายการ products: query parser → LIMIT/OFFSET และ COUNT → summary DTO + metadata
- รายละเอียด: find by key พร้อม JOIN → ถ้าไม่พบ throw 404 ก่อนเข้า mapper

โจทย์จริงอาจจัด 3R ต่างกัน ให้ดู endpoint ของข้อสอบ ไม่มีหลักประกันว่าจะใช้ชื่อ resource เหมือน kit

## 1U: Update

ตรวจว่ามีแถวก่อน → validate full body → ถ้า SKU ของอีก id ซ้ำตอบ 409 → UPDATE ด้วย WHERE id=? → อ่านแถวกลับ ตอบ 200

การส่งค่าเดิมทุกฟิลด์เป็น update ที่ถูกต้อง อย่าใช้ `changedRows===0` ตัดสินว่าไม่มีแถว เพราะอาจมีแถวแต่ค่าไม่เปลี่ยน

## 1D: Delete

ตรวจแถว → DELETE WHERE id=? → ตรวจ affectedRows → 204 `.end()` โดยไม่ส่ง JSON ถ้าสเปกเป็น W6 ให้ส่ง 200 พร้อม envelope ตามโจทย์ หาก FK อ้างอิงอยู่ให้ปล่อย error เข้าตัวแปลงกลาง

## SQL ที่ต้องเขียนเองได้

```sql
SELECT id, sku, name FROM products ORDER BY id LIMIT ? OFFSET ?;
SELECT COUNT(*) AS total FROM products;
SELECT p.id, p.name, b.name AS brand_name
FROM products p JOIN brands b ON b.id=p.brand_id WHERE p.id=?;
INSERT INTO products (sku,name,brand_id,category,price) VALUES (?,?,?,?,?);
UPDATE products SET name=?, price=? WHERE id=?;
DELETE FROM products WHERE id=?;
```

ส่ง values ผ่าน parameter binding ไม่ต่อ string จาก request ลง SQL ตัวอย่าง repo ใช้ `query('INSERT ... SET ?', [data])` กับ object ที่ service เลือกฟิลด์ไว้แล้ว ซึ่ง mysql2 `.query` รองรับ อย่าสลับเป็น `.execute` แล้วส่ง object แบบเดียวกัน

ทดสอบด้วยข้อมูลของตัวเอง ดู SQL persistence หลัง POST/PUT และ GET หลัง DELETE ไม่ถือว่า response อย่างเดียวพิสูจน์การบันทึกแล้ว
