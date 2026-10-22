# บท 01 — เปิด template ใน WebStorm ให้ถูกโฟลเดอร์

เป้าหมายบทนี้คือเปิด source ถูกชุด ติดตั้ง dependencies ได้ และรู้คำสั่งเปิดคู่มือ/เปิด API โดยยังไม่ต้องแก้ SQL

## ขั้นที่ 1 — แยก ZIP อาจารย์กับชุดคู่มือ

**ทำที่ไหน:** Finder/File Explorer ก่อนเปิด WebStorm

**ทำอะไร:** เก็บคนละโฟลเดอร์:

```text
INT161/
├── teacher-template/     แตก midterm-exam-esm-template.zip ไว้เป็นต้นฉบับ
└── int161-exam-kit/      ชุดโค้ดตัวอย่าง + คู่มือที่กำลังอ่าน
```

**ทำไม:** ZIP อาจารย์มี placeholder ส่วน exam-kit เติมตัวอย่างให้รันได้แล้ว การเปิดต้นฉบับแล้วคาดว่าจะ query products ได้ทันทีจะทำให้สับสน

**ควรเห็น:** โฟลเดอร์ที่เลือกทำงานมี package.json, package-lock.json และ src อยู่ระดับเดียวกัน โฟลเดอร์ชั้นนอกที่มีแต่ folder อีกชั้นไม่ใช่ project root

**ถ้าไม่ผ่าน:** เปิดลงไปอีกหนึ่งชั้นจนเจอ package.json ไม่ใช้ __MACOSX หรือ .idea เป็น project root และไม่ทับ ZIP ต้นฉบับด้วยโค้ดตัวอย่าง

## ขั้นที่ 2 — เปิดใน WebStorm

**ทำที่ไหน:** หน้า Welcome → Open หรือเมนู File → Open

**ทำอะไร:** เลือก folder int161-exam-kit ที่มี package.json ถ้า IDE ถาม Trust ให้ตรวจว่าเป็นไฟล์ของวิชาที่เตรียมเองก่อนเลือก Trust Project

**ทำไม:** IDE ต้องรู้ project root เพื่อหา dependencies, import และ working directory ของ Terminal

**ควรเห็น:** Project ด้านซ้ายมี src, guides, requests และ package.json ถ้า Project panel ไม่แสดงให้เปิด View → Tool Windows → Project

**ถ้าไม่ผ่าน:** ถ้าไฟล์ถูกเปิดเดี่ยว ๆ ให้เปิด folder ใหม่ เมนู/ตำแหน่งอาจต่างตามรุ่น ใช้ Find Action ค้นชื่อ “Open” หรือ “Terminal” ได้

[อ้างอิงเมนูเปิด project ของ JetBrains](https://www.jetbrains.com/help/webstorm/opening-reopening-and-closing-projects.html?keymap=windows)

## ขั้นที่ 3 — ติดตั้ง package

**ทำที่ไหน:** View → Tool Windows → Terminal ตรวจว่าปัจจุบันอยู่ folder ที่มี package.json

**ทำอะไร:** ชุด exam-kit มี lockfile แล้ว ใช้:

```sh
npm ci
```

**ทำไม:** package.json บอกรายชื่อ ส่วน npm ci ติดตั้งตาม package-lock.json ลง node_modules ถ้ากำลังเริ่มโปรเจกต์ใหม่ที่ไม่มี lockfile จึงใช้ npm install ตามงานนั้น

**ควรเห็น:** คำสั่งจบสำเร็จและมี node_modules ตัวเลข packages/audit อาจต่างตามรุ่น ไม่ต้องตรงกับตัวอย่างของคนอื่น

**ถ้าไม่ผ่าน:** ENOENT package.json = อยู่ผิด folder; ERR_MODULE_NOT_FOUND ขณะรัน = dependencies ยังไม่พร้อม; network error = ต้องเตรียมตอนยังอนุญาตอินเทอร์เน็ต ไม่รอติดตั้งระหว่างสอบ

[อ้างอิง npm ใน WebStorm](https://www.jetbrains.com/help/webstorm/installing-and-removing-external-software-using-node-package-manager.html)

## ขั้นที่ 4 — เข้าใจ type: module

**ทำที่ไหน:** เปิด package.json ใน editor

**ทำอะไร:** ตรวจว่ามี "type": "module" และ start เรียก src/app.js:

```json
{
  "type": "module",
  "scripts": {
    "start": "node --env-file-if-exists=.env src/app.js",
    "study": "node local-study/server.mjs"
  }
}
```

นี่เป็นเฉพาะส่วนที่อธิบาย ไม่ใช่ให้ทับ package.json ทั้งไฟล์ เพราะจะทำให้ dependencies/scripts อื่นหาย

**ควรเห็น:** source ใช้ import/export และ relative imports มี .js ต่อท้าย

**ถ้าไม่ผ่าน:** ตรวจ type และ import path ก่อนเปลี่ยนไปใช้ require แบบปะปนกัน

## ขั้นที่ 5 — เปิดคู่มือและเตรียม .env

**ทำที่ไหน:** Terminal แรกใน project root

```sh
npm run study
```

**ควรเห็น:** INT161 Study Desk พร้อม URL http://127.0.0.1:8171 เปิดใน Browser แล้วอ่านคู่มือได้แม้ MySQL ยังไม่ได้ตั้งค่า

**ทำต่อ:** เปิด Terminal อีกแท็บ แล้วคัดลอก .env.example เป็น .env ถ้ายังไม่มีไฟล์ .env หากมีแล้วให้เปิดแก้ไฟล์เดิม ไม่คัดลอกทับค่าของตัวเอง:

```sh
cp .env.example .env
```

ใน Windows/IDE คัดลอก .env.example แล้วตั้งชื่อ .env ผ่าน Project panel ได้เหมือนกัน อย่าเผลอตั้งเป็น .env.txt

**ถ้าไม่ผ่าน:** EADDRINUSE ที่ 8171 หมายถึงคู่มือเปิดอยู่แล้ว ให้ใช้หน้าเดิมหรือหยุด server ที่ตัวเองเปิดก่อน อย่าไล่ปิด process ที่ไม่รู้ว่าเป็นอะไร

## Self-check

- เปิด project root ถูกและเห็น source ครบ
- npm ci จบสำเร็จ มี node_modules
- เข้าใจว่าไม่แก้ node_modules และไม่ทับ package.json ด้วย snippet สั้น
- เปิด Study Desk ได้ และเตรียม .env ส่วนตัวแล้ว

[บทก่อนหน้า](../../START-HERE.th.md) · [บท 02 — ต่อฐานข้อมูล](02-database.md)
