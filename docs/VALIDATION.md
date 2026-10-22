# ผลตรวจ Template

รุ่น 3.2.0 ตรวจบน macOS, Node 26.5.1 และ MySQL 9.7.1 ในเครื่อง

- npm test: 33/33 ผ่าน รวม CRUD persistence, DTO/types/JOIN/date, pagination, error contracts, unchanged update, string/composite key และ request samples กับ MySQL จริง
- เทียบ midterm-exam-esm-template.zip ที่ได้รับ: มี src ครบทั้ง 9 path เดิม ไม่มี controllers-$id หรือ server.js; app.js เป็น entrypoint, route.js รับ req/res เอง
- ตรวจสำเนา ZIP อาจารย์จริงด้วย verify:template: API contracts 9/9 และ npm start เรียก app.js ได้ HTTP 200 ทั้ง student-info/products โดยไม่แก้ ZIP ต้นฉบับ
- Regression: app.js ที่พังเฉพาะ runtime ถูกตรวจพบ แม้ import factory ผ่าน
- ชื่อ service getObject/getAllObjects/createObject/updateObject/removeObject, repository findOne/findAll/create/update/remove, EntityDtoMapper.map/maps, apiResponse และ queryParser() ใช้รูปแบบเดียวกับ template
- คู่มือทำตาม6บทมีไฟล์/ขั้นตอน/เหตุผล/ผลที่ควรเห็น/วิธีแก้เมื่อติด พร้อมบทก่อนหน้า-ถัดไปและSelf-checkที่จำในเบราว์เซอร์ ทดสอบUIจริงว่าจำหลังreloadได้
- เอกสารและ Diagram เปิดไฟล์ตามชื่อใหม่ สีโค้ดแยกภาษาและไม่ตีความ URL ในคำสั่ง shell เป็น comment
- DB_MODE=practice ตรวจ prefix+marker; DB_MODE=exam บังคับ DB/identity จริง ตรวจ connectivity ไม่สร้าง/resetฐาน db:init/tests ปฏิเสธ exam mode
- หน้า localhost เป็นเครื่องมืออ้างอิงเพิ่มเติม ไม่ใช่ source ที่ต้องส่งทั้งหมด ส่วน settings/database-mode/app-error/error-handler, factories, sample schema, timestamp และ pagination policy ที่เพิ่ม ระบุไว้ในแผนที่ไฟล์
- Postman collection ตรวจโครงสร้างและมี curl smoke test กับ API/MySQL จริง ไม่ได้เปิด Postman GUI ทดสอบ

schema และ response ของข้อสอบจริงต้องปรับตามสเปก ผลตรวจนี้ใช้ฐานตัวอย่าง ไม่รับรองทุก schema/Windows/MySQL ทุกรุ่น ต้องเตรียม dependencies ไว้ก่อนตัดอินเทอร์เน็ต

Overall Diagram ตรวจว่ามีmutationเฉพาะC/U/Dที่ขั้นMySQL, Readไม่เขียนDB, กรณี400/404/409หยุดก่อนmutation, DELETEไม่ผ่านMapperและตอบ204, not-foundไม่ส่งnullเข้าMapper แต่ละขั้นลิงก์ไปไฟล์จริง แผนภาพเป็นข้อมูลจำลองไม่ทดแทนการทดสอบAPI
