# 06 — Pagination

## รับค่าและ normalize ก่อนคำนวณ

GET /products?page=2&limit=10 ใช้pageเริ่ม1

```js
const offset = (page - 1) * limit;
const totalPages = Math.ceil(total / limit);
const hasNextPage = page < totalPages;
const hasPrevPage = page > 1;
```

ตัวอย่างpage2/limit10 → offset10 → ข้าม10รายการแรก ต้องใช้limitที่ผ่านcapแล้วคำนวณoffset

## SQL และ DTO

```sql
SELECT id,sku,name,brand_id,category,price,status
FROM products ORDER BY id LIMIT ? OFFSET ?;
SELECT COUNT(*) AS total FROM products;
```

queryรายการและCOUNTต้องใช้filterชุดเดียวกัน หากโจทย์เพิ่มsearchให้แก้ทั้งคู่ ไม่ใช้จำนวนrowsในหน้าปัจจุบันเป็นtotal ใช้ORDER BYแน่นอนก่อนแบ่งหน้า

คืนdataเป็นsummary DTOและpaginationมีtotal/page/limit/totalPages/hasNextPage/hasPrevPage

## นโยบายชุดฝึกที่ผู้ช่วยเพิ่ม

default page1/limit10, maxlimit100; queryต้องเป็นstringตัวเลขจำนวนเต็มบวก ถ้าว่าง/ลบ/ทศนิยม/ตัวอักษรปน/ซ้ำ/overflowตอบ400 นี่เป็นนโยบายฝึก ไม่ใช่ข้อยืนยันว่าข้อสอบจริงระบุmaxและinvalidpolicyเหมือนกัน

- page1,limit10,total23 →3หน้า มีหน้าถัดไป
- page3 →3รายการสุดท้าย ไม่มีหน้าถัดไป
- page999 →[]แต่totalยัง23
- total0 →[] totalPages0 ห้ามfallbacktotalไปค่าอื่นด้วย `||`
- limit500 →normalize100 แล้วค่อยหาoffset

โค้ดจริง: [parser](../src/middlewares-$id/pagination-middleware.js), [repository](../src/repositories-$id/repository.js), [metadata](../src/mappers-$id/api-response.js), [handler](../src/routes-$id/route.js)

ถ้าโจทย์กำหนดไม่มีqueryให้คืนทั้งหมด ต้องแก้ทั้งparser/SQL/response ไม่แก้แค่default ดู [optional recipe](../recipes/README.md)
