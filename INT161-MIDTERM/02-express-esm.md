# 02 — Express และ JavaScript ESM

## โครงที่ต้องมี

package.json ใช้ `"type":"module"` เพื่อให้ไฟล์ .js เป็น ESM ใช้ import/export ให้สอดคล้องกัน ไม่ผสม require/module.exports โดยไม่ตั้งใจ

```js
import express from 'express';
const app = express();
app.use(express.json());
app.get('/api/demo001/ping', (req, res) => {
  res.status(200).json({success:true,data:{message:'pong'}});
});
app.listen(3000, '127.0.0.1');
```

ตัวอย่าง ping นี้ผู้ช่วยเพิ่มเพื่ออธิบาย ไม่ใช่ endpointที่อาจารย์ระบุในใบงาน

importไฟล์ของตัวเองต้องเขียน relative path และ `.js` เช่น `import {createApp} from './app.js'` ส่วน packageใช้ชื่อเช่น `import mysql from 'mysql2/promise'`

## Middleware และ Router

ลำดับมีผล: express.json → router → not-found middleware → error middleware ถ้า body parserอยู่หลัง route จะอ่านJSONไม่ได้ ถ้า error handlerอยู่ก่อนroute อาจไม่รับ errorจากrouteที่อยู่ถัดไป

```js
const router = express.Router();
router.get('/products/:id', async (req, res) => {
  const dto = await service.getObject(req.params.id);
  return res.json({success:true,data:dto});
});
app.use('/api/demo001', router);
```

snippetนี้แสดงการใช้ Router เท่านั้น ต้องมี service ที่ประกอบแล้วและตรวจidก่อนเรียกตามเฉลยจริง

## async/await กับ DB

DB query คืน Promise ต้อง await ก่อนใช้ผลลัพธ์ mysql2/promise คืน `[rows, fields]` สำหรับSELECT และ `[result, fields]` สำหรับ INSERT/UPDATE/DELETE

```js
const [rows] = await db.query('SELECT id,name FROM products WHERE id=?', [id]);
const entity = rows[0] ?? null;
```

Express5ที่ kitใช้ส่ง rejected Promiseจาก async handlerเข้าสู่ error middlewareได้ หากใช้ Express4 ต้องส่ง next(err) ผ่าน try/catchหรือwrapperตามโครงงาน

## app กับ server ต่างกัน

[app.js](../src/app.js) ประกอบ routes และเปิด port เมื่อรันผ่าน npm start หรือ node --env-file-if-exists=.env src/app.js; เมื่อ import เพื่อทดสอบจะไม่เปิด port อัตโนมัติ

เริ่มด้วย [START-HERE](../START-HERE.th.md) และดู [การใส่ใน template](../guides/05-template.md)
