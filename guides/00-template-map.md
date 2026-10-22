# แผนที่ไฟล์ — ตรงกับ midterm-exam-esm-template.zip

ตรวจชื่อไฟล์จาก ZIP อาจารย์แล้ว รุ่นนี้ใช้ไฟล์หลักตามนั้น ไม่มีโฟลเดอร์ Controller แยก และไม่มี server.js

```text
src/
├── app.js
├── test-service.js
├── configs-$id/
│   └── db-config.js
├── routes-$id/
│   └── route.js
├── services-$id/
│   └── service.js
├── repositories-$id/
│   └── repository.js
├── mappers-$id/
│   ├── api-response.js
│   └── entity-dto-mapper.js
└── middlewares-$id/
    └── pagination-middleware.js
```

## วิธีไล่อ่านโค้ดตาม ZIP

1. [app.js](../src/app.js): JSON middleware, mount router, error middleware และเปิด port
2. [route.js](../src/routes-$id/route.js): รับ method/path, อ่าน req.params/query/body, เรียก service แล้วส่ง res
3. [service.js](../src/services-$id/service.js): validation, ไม่พบ/ข้อมูลซ้ำ, เรียก repository และ mapper
4. [repository.js](../src/repositories-$id/repository.js): SQL SELECT/INSERT/UPDATE/DELETE พร้อม bind ค่า
5. [entity-dto-mapper.js](../src/mappers-$id/entity-dto-mapper.js): EntityDtoMapper.map/maps และ Summary/Detail DTO
6. [api-response.js](../src/mappers-$id/api-response.js): apiResponse(res,data,pagination,status)
7. [pagination-middleware.js](../src/middlewares-$id/pagination-middleware.js): queryParser() คืน middleware

Route ทำหน้าที่ HTTP handler อยู่ในไฟล์เดียวกับ Router ตาม template ไม่ต้องสร้าง controllers-$id เพื่อใช้โค้ดนี้

## ชื่อฟังก์ชันที่ใช้เทียบกัน

| ไฟล์ | ชื่อใน template / ชุดนี้ |
| --- | --- |
| service.js | getAllObjects(pagination), getObject(id), createObject(data), updateObject(id,data), removeObject(id) |
| repository.js | findAll(pagination), findOne(id), create(data), update(id,data), remove(id) |
| entity-dto-mapper.js | EntityDtoMapper.toSummaryDTO, toDetailDTO, map, maps |
| api-response.js | apiResponse(res,data,pagination=null,status=200) |
| pagination-middleware.js | queryParser() → (req,res,next) |
| db-config.js | default export db pool |

## ส่วนที่เพิ่มให้โครงรันและตรวจงานได้

ส่วนต่อไปนี้เป็นของชุดอ้างอิง **ไม่ใช่ไฟล์เดิมที่อยู่ใน ZIP**:

- settings.js และ database-mode.js: อ่าน .env และแยกฐานฝึก/ฐานสอบ
- app-error.js และ error-handler.js: ส่ง error contract ให้ครบ
- createApp/createRouter/createService/createRepository/createDb: factory รองรับการทดสอบแยกฐานข้อมูล; ใช้งานปกติผ่าน named exports ตามชื่อด้านบนได้
- schema/ข้อมูล products, brands, tags, product_tags และคำสั่ง db:init: ตัวอย่างเพิ่ม ไม่ใช่ schema ข้อสอบจริง
- localhost Study Desk, guides, tests และ Postman collection: เอกสาร/เครื่องมืออ้างอิง ไม่ใช่ไฟล์ที่ต้องส่งทั้งหมด

## จุดที่ต้องยึดสเปกสอบ ไม่ใช่คัดลอกเหมือนทุกบรรทัด

- Template เดิมใช้ table-name, primaryKey และข้อมูลตัวอย่างใน mapper เป็น placeholder ต้องเปลี่ยนตามฐานจริง
- โครงนี้แปลงข้อมูล products/brands เป็น DTO ตัวอย่าง และเพิ่ม timestamp ตามแนวงาน W8; template api-response เดิมไม่ได้บังคับ timestamp ถ้าสเปกไม่กำหนดให้เอาออกจาก response helpers
- Pagination ของชุดนี้ตรวจ query ผิดเป็น 400, default 1/10 และ cap100; template เดิมเปิด pagination เมื่อส่งทั้ง page และ limit ให้เลือก policy ตามโจทย์
- ใช้ offset จาก limit หลัง normalize เพื่อไม่ให้ query กับ metadata ไม่ตรงกัน
- PUT ใน template มีจุดเรียก updateObject() โดยไม่ส่ง id/body; ชุดนี้ส่งครบแล้ว
- ไม่ส่ง totalItems ด้วยการแปะ property ลง Array เพราะ JSON ไม่เก็บ property นั้น ให้ส่ง {items,totalItems} เข้า apiResponse แล้วคืน data เป็น array พร้อม pagination แยก
- test-service.js ในชุดนี้เป็น read-only smoke check ไม่เรียก DELETE กับข้อมูลคงที่แบบไฟล์ตัวอย่างเดิม

ชื่อและการแบ่งหน้าที่ตรงกับ template แต่โค้ดที่เติมต้องถูกต้องตามสเปก ไม่จำลองบั๊กหรือ placeholder ของโครงเปล่า
