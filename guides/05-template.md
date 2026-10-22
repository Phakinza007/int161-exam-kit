# นำโค้ดไปใช้กับ template อาจารย์

ไฟล์หลักตั้งชื่อตรง ZIP แล้ว ดู [แผนที่ไฟล์](00-template-map.md) เพื่อแยกของอาจารย์กับ helpers ที่เพิ่ม

## แก้จากไฟล์เดิมทีละส่วน

| เปิดไฟล์ใน ZIP | ใส่อะไรจากโครงนี้ |
| --- | --- |
| src/app.js | express.json, mount route, error handler และ listen |
| src/configs-$id/db-config.js | host/user/password/database ของตัวเอง |
| src/routes-$id/route.js | method/path, req.params/query/body, เรียก service, apiResponse |
| src/services-$id/service.js | getObject/getAllObjects/createObject/updateObject/removeObject และ validation |
| src/repositories-$id/repository.js | findOne/findAll/create/update/remove และ SQL ตาม schema |
| src/mappers-$id/entity-dto-mapper.js | toSummaryDTO/toDetailDTO/map/maps |
| src/mappers-$id/api-response.js | envelope/status/pagination ตามสเปก |
| src/middlewares-$id/pagination-middleware.js | queryParser() และกฎ page/limit |

ไม่ต้องสร้าง Controller เพิ่ม ชื่อที่บอกว่า controller ในแนวคิดหมายถึงส่วนรับ/ตอบ HTTP ซึ่งอยู่ใน route.js ของ template นี้

## Entry และ package.json

คง type: module และ dependencies ที่อาจารย์ให้ เพิ่ม script เฉพาะที่ต้องใช้ ไม่ทับ package.json ทั้งไฟล์:

```json
{"scripts":{"start":"node --env-file-if-exists=.env src/app.js"}}
```

ถ้าใช้ helpers ของชุดนี้ ต้องย้าย settings.js/database-mode.js/app-error.js/error-handler.js ที่ source import ด้วย และตั้ง .env ของตัวเอง ถ้าจะตัด helpers ออก ต้องแก้ imports/การอ่าน config ให้ครบ

## ต่อฐานโจทย์

ตั้ง DB_MODE=exam และ DB_NAME/STUDENT_ID/STUDENT_NAME/STUDENT_KEY เป็นค่าจริงครบ โหมดนี้ตรวจเชื่อมต่อ ไม่สร้าง/seed/resetฐาน ใช้ SQL อาจารย์ ไม่ใช้ db:init หรือชุดทดสอบฐานฝึกกับฐานสอบ

ถ้าอาจารย์ให้ rename -$id เป็นรหัสตัวเอง ต้องแก้ทั้ง folder และทุก import ที่อ้างถึง ส่งเฉพาะโค้ด/config ตามคำสั่ง ไม่รวม node_modules หรือคู่มือทั้งหมดโดยอัตโนมัติ

## ตรวจการประกอบกับ ZIP

```sh
npm run verify:template -- --template /absolute/path/midterm-exam-esm-template.zip
```

คำสั่งแตก ZIP เป็นสำเนาชั่วคราว คัดลอก source ที่ชื่อตรง template และ helpers เพิ่ม start ที่เรียก app.js โดยคง scripts/dependencies อื่น แล้วทดสอบกับฐานฝึกและ npm start จริง ไม่แก้ ZIP ต้นฉบับ ไม่ยืนยัน schema/response ของโจทย์ที่ยังไม่ได้ปรับ
