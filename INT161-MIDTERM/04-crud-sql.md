# 04 — CRUD และ SQL

ดูเฉลยทั้งระบบใน [repository](../src/repositories-$id/repository.js) และ [service](../src/services-$id/service.js)

## 1 Create

validate/allowlist → INSERT → insertId → SELECTกลับ → DTO →201

```sql
INSERT INTO products (sku,name,brand_id,category,price) VALUES (?,?,?,?,?);
```

snippetแสดงหลักINSERTเท่านั้น ถ้าschemaจริงมี NOT NULLอื่นต้องส่งให้ครบ ใช้ `result.insertId` เฉพาะauto-increment ไม่ใช้SELECT MAX(id) สำหรับstringPKอ่านกลับด้วยkeyที่clientส่ง

## 3 Read ในเส้นทางฝึก

```sql
SELECT id,name,country_of_origin,website,is_active,created_at
FROM brands ORDER BY id;
SELECT id,sku,name,brand_id,category,price,status
FROM products ORDER BY id LIMIT ? OFFSET ?;
SELECT p.id,p.name,b.name AS brand_name
FROM products p JOIN brands b ON b.id=p.brand_id WHERE p.id=?;
SELECT COUNT(*) AS total FROM products;
```

listคืนarray ถ้าไม่มีข้อมูลคืน[]; detailคืนแถวเดียว ถ้าไม่พบต้อง404ก่อนเข้าmapper อย่าใช้SELECT*แล้วส่งทุกfieldออกAPI

## 1 Update

```sql
UPDATE products SET name=?, price=? WHERE id=?;
```

ตรวจexistingก่อนและอ่านแถวกลับหลังUPDATE การส่งค่าเดิมสำเร็จได้แม้changedRowsเป็น0 อย่าแปลว่าไม่มีแถว

## 1 Delete

```sql
DELETE FROM products WHERE id=?;
```

ต้องมีWHEREและbindid ตรวจaffectedRows รับnot-foundและFKerror ตอบ204ว่างตามW8 หรือ200JSONตามW6

## mysql2 binding

```js
const [rows] = await db.query('SELECT id,name FROM products WHERE id=?', [id]);
```

parameterแทนค่าข้อมูล ไม่แทนชื่อตาราง/คอลัมน์ที่มาจากrequest สำหรับ `query('INSERT INTO products SET ?', [data])` ต้องผ่านallowlistก่อน และอย่าเปลี่ยนเป็นexecuteโดยส่งobjectแบบเดียวกัน

## Key และ constraint

- PRIMARY KEY: ระบุแถว; compositeต้องมีทุกส่วนในWHERE
- UNIQUE: กันซ้ำแม้มีprecheckแล้ว เช่นSKU
- FOREIGN KEY: ปลายทางต้องมี; ON DELETE RESTRICTกันลบแถวที่ยังถูกอ้างอิง
- VARCHAR keyเช่นNAต้องคงstring ไม่Number

เช็กผลหลังPOST/PUTด้วยGETและSQLจริง หลังDELETEตรวจว่าแถวหาย ใช้เฉพาะข้อมูลฝึกของตนเอง ดู [guideรายข้อ](../README.md)
