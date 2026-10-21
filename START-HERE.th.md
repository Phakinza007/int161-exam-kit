# เริ่มใช้ Template

## เตรียมก่อนตัดเน็ต

ต้องมี Node >=22.9, MySQL เปิดอยู่ และดาวน์โหลดdependenciesเรียบร้อย repoเป็นpublic ดาวน์โหลดได้ผ่าน GitHub

```sh
git clone https://github.com/Phakinza007/int161-exam-kit.git
cd int161-exam-kit
npm ci
cp .env.example .env
```

ถ้าดาวน์โหลดZIPให้แตกแล้วcdเข้าโฟลเดอร์ที่มีpackage.json จากนั้นnpm ciและcopy.env.exampleเหมือนกัน ZIPไม่รวมnode_modules ใช้เครื่องสอบจริงเตรียมไว้ก่อน

## เปิดโครงด้วยฐานตัวอย่าง

ตั้ง `.env` ให้ตรงMySQLเครื่องตัวเอง เช่นDB_USER/DB_PASSWORD ส่วนDB_MODEให้เป็นpractice และDB_NAMEเป็นint161_practice_catalog

```sh
npm run db:init
npm run doctor
npm start
```

เปิด `http://127.0.0.1:3000/api/demo001/products?page=1&limit=10` ได้APIจริงแล้ว ต่อไปปรับโค้ดจาก [GUIDE.md](GUIDE.md) ไม่ต้องทำโจทย์ฝึกเพิ่ม

`db:init` สร้างเฉพาะฐานprefix int161_practice_ ที่มีmarkerของชุดนี้ หากฐานชื่อเดียวกันมีอยู่แต่ไม่มีmarkerให้เลือกชื่อฝึกใหม่ที่ยังไม่มี ไม่เติมmarkerลงฐานที่ไม่รู้ที่มา

## ใช้กับฐานที่อาจารย์กำหนด

หลังอ่านschemaและปรับโค้ดตามGUIDEแล้ว ตั้งค่าชัดเจนใน.env:

```dotenv
DB_MODE=exam
DB_NAME=database_name_from_spec
STUDENT_ID=your_actual_id
STUDENT_NAME=Your Name
STUDENT_KEY=key_from_spec
```

แก้host/port/user/passwordให้ถูก แล้ว `npm run doctor` และ `npm start` โหมดนี้ตรวจconnectivityอย่างเดียว ไม่สร้างตาราง/seed/reset/บังคับmarker ต้องนำเข้าSQLของอาจารย์เองตามคำสั่ง ห้ามใช้db:initหรือtestของชุดนี้กับฐานสอบ โหมดexamจะปฏิเสธหากDB_NAME/STUDENT_ID/STUDENT_NAME/STUDENT_KEYว่างหรือยังใช้ค่าตัวอย่าง ต้องเปลี่ยนYour Name/key_from_specในsnippetด้านบนเป็นค่าจริงก่อนรัน

หากSQL/requiredfieldsยังเป็นproductsของตัวอย่าง ต้องแก้ให้ตรงก่อนยิงPOST/PUT/DELETE ไม่ถือว่าการเปลี่ยน.envอย่างเดียวทำให้รองรับทุกโจทย์

## ระหว่างแก้งาน

เปิด [GUIDE.md](GUIDE.md) คู่กับsrc ค้นคอมเมนต์ `ADAPT` แก้ตามลำดับ แล้วส่งrequestจาก [catalog.http](requests/catalog.http) โดยแก้baseURL/bodyให้ตรงโครงของตัวเอง

Ctrl+Cหยุดserver ไม่commit.env หลังเตรียมเอกสารและdependenciesในช่วงที่อนุญาต ระหว่างสอบห้ามใช้อินเทอร์เน็ต รับ/ส่งprojectตามLEB2และคำสั่งอาจารย์

## เปิดคู่มือใน localhost

รัน `npm run study` แล้วเปิด http://127.0.0.1:8171 เพื่อค้นคู่มือและ source พร้อมสีโค้ด อีก Terminal ใช้ `npm start` เปิด API ที่ port3000 ดู [Postman](POSTMAN.md) สำหรับการส่ง request แบบละเอียด
