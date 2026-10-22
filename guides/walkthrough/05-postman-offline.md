# บท 05 — ทดสอบด้วย Postman แล้วเตรียมใช้ตอนสอบ

เป้าหมายคือส่ง request ครบ 6 งาน อ่านผลอย่างมีหลักฐาน และเปิดทุกอย่างในเครื่องได้หลังตัดอินเทอร์เน็ต ไม่ใช่แค่ importcollection สำเร็จ

## ขั้นที่ 1 — เปิด server ให้ถูกตัว

**ทำที่ไหน:** Terminal ที่รัน npm start และ Postman desktop

**ทำอะไร:** ตรวจ API ที่ http://127.0.0.1:3000/api/demo001/student-info ก่อน request อื่น ถ้าเปลี่ยน PORT/STUDENT_ID ให้ใช้ค่าจริง

**ควรเห็น:** HTTP200 และ data.studentId ตรง config

**ถ้าไม่ผ่าน:** connectionrefused ไม่มี JSON ที่ port3000 = ไม่มี API รับ; ได้ JSON500 ตอน queryDB = API ทำงานแต่ DB/SQL มีปัญหา หน้า 8171 เป็นเอกสาร ไม่ใช่ API

## ขั้นที่ 2 — เลือกวิธีส่ง request

**ทาง A:** ถ้า Postman โหมดที่ใช้มี Import/Collections เลือก Import แล้วเปิด requests/postman.json จากเครื่อง ตั้ง collection variable baseUrl เป็น http://127.0.0.1:3000/api/demo001

**ทาง B:** Lightweight/offline ที่ไม่มี collectionvariables ให้เปิด HTTPrequest แล้วใช้ URL เต็ม ไม่ต้องพึ่ง{{baseUrl}} ดูปุ่มและตัวอย่างแบบละเอียดใน [POSTMAN.md](../../POSTMAN.md)

**ควรเห็น:** URL ถูก resolve ก่อน Send ถ้า {{baseUrl}} หรือ {{productId}} ยังเป็นข้อความเตือน ให้ตั้ง variable หรือใส่ค่าจริง

**ถ้าไม่ผ่าน:** อย่าแก้ SQL เมื่อปัญหาเป็น variable; เตรียม desktopapp และลองโหมด offline ก่อนสอบ ไม่รอ Sign in/โหลด extension ระหว่างสอบ

## ขั้นที่ 3 — เริ่มอ่านก่อนเขียนข้อมูล

**ทำอะไร:** ส่ง GET /brands และ GET /products?page=1&limit=10

**ควรเห็น:** brands เป็น array และมี brand_id ที่นำไป POST ได้ products มี SummaryDTO และ pagination

**ถ้าไม่ผ่าน:** 404 ตรวจ method/prefix/path; 500 ตรวจ Terminal/SQL; ข้อมูลผิด field ตรวจ mapper

## ขั้นที่ 4 — Create แล้วจด ID ของตัวเอง

**ทำที่ไหน:** New HTTP request → Method POST → URL เต็มลงท้าย/products → Body → raw → JSON

```json
{
  "sku": "GUIDED-001",
  "name": "Guided Phone",
  "brand_id": 1,
  "category": "PHONE",
  "price": 1200.5,
  "ram_gb": 8,
  "storage_gb": 128,
  "color": "Black"
}
```

**ทำไม:** rawJSON ทำให้ Content-Type เป็น application/json และ express.json อ่าน body ได้ เลือก brand_id ที่มีจริง ถ้า GUIDED-001 เคยใช้ให้เปลี่ยนเป็น SKU ใหม่

**ควรเห็น:** 201 และ data.id จด ID/SKU ลงโน้ตของตัวเอง Collection ที่ให้มี script จับ ID ให้อัตโนมัติเมื่อ response ตรงรูปแบบนี้ แต่ถ้าใช้ request เองต้องจดเอง

**ถ้าไม่ผ่าน:** rawText/JSONcomma ผิด = ตรวจ body และ headers; SKU ซ้ำ 409 = ตรวจแถวเดิม; FK ผิด 400 = brand_id ไม่พบ; required400 = field หรือชนิดไม่ครบ

## ขั้นที่ 5 — Detail และ Update

**ทำอะไร:** GET /products/ID ที่จด แล้ว PUT URL เดียวกัน ใช้ body เต็มจากขั้น 4 เปลี่ยน name เป็น Guided Phone Updated

**ควรเห็น:** GET200 มี brandName และ DetailDTO; PUT200 มีชื่อใหม่; GET อีกครั้งยืนยันว่าฐานบันทึกจริง PUT ค่าเดิมซ้ำยัง 200

**ถ้าไม่ผ่าน:** PUT แค่ name ไม่พอสำหรับ fullbody ของชุดนี้ ถ้า 404 ตรวจ ID จริง ไม่ใส่ ID จากรูปคนอื่นหรือคำว่า ID ลงใน URL

## ขั้นที่ 6 — Delete และตรวจหลังลบ

**ทำอะไร:** DELETE /products/ID ที่สร้าง เลือก Body none แล้ว Send จากนั้น GET เลขเดิมซ้ำ

**ควรเห็น:** DELETE204body ว่าง และ GET404 ไม่ใช่ 200 กับ object ว่าง

**ถ้าไม่ผ่าน:** ถ้า 409 ตรวจ FK/ความสัมพันธ์ ไม่ลบแถวอื่นเพื่อให้ผ่าน ถ้า DELETE ซ้ำ 404 ถือว่าถูกตาม policy ชุดนี้

## ขั้นที่ 7 — ตรวจผลแบบตาราง

| งาน | หลักฐานที่ต้องดู |
| --- | --- |
| Create | 201, data.id, SELECT/GET เห็นแถวจริง |
| Read list | 200, dataarray, field ตรง |
| Read page | 200, limit/offset/count/metadata ถูก |
| Read detail | 200object หรือ 404 ตามข้อมูล |
| Update | 200, GET/SELECT เห็นค่าหลังแก้, ค่าเดิมยังผ่าน |
| Delete | 204 ว่าง, GET หลังลบ 404 |

เช็ก negative cases จาก [บท 04](04-contracts.md) ด้วย ไม่ดูแค่สีเขียวใน Postman การเปลี่ยน HTTPstatus อย่างเดียวไม่ทำให้ SQL หรือ DTO ถูก

## ขั้นที่ 8 — หยุด/เริ่มใหม่และลอง Offline

**ทำที่ไหน:** Terminal ของ server ที่ตัวเองเปิด

**ทำอะไร:** Ctrl+C หยุด API แล้ว npm start ใหม่เพื่อจับ import/config ที่ผิด ลองตัดอินเทอร์เน็ตด้วยตัวเองก่อนวันสอบ แล้วเปิดคู่มือและส่ง requestlocalhost อีกครั้ง

**ควรเห็น:** หน้าเอกสารยังอ่านได้, dependencies ติดตั้งไว้แล้ว, MySQL ในเครื่องทำงาน, request ไป 127.0.0.1 ได้โดยไม่พึ่งเว็บภายนอก

**ถ้าไม่ผ่าน:** หากโปรแกรมต้องลงชื่อเข้าใช้หรือ import ใหม่ ให้เตรียมโหมดที่ใช้งานได้ล่วงหน้าและเก็บ URL/body ไว้ในไฟล์ .http/.md ใช้เอกสารตามช่วง 15 นาทีก่อนสอบที่อาจารย์อนุญาต ระหว่างสอบห้ามเชื่อมอินเทอร์เน็ต

## ขั้นที่ 9 — ย้ายลง template และส่งตามคำสั่ง

ใช้ [แผนที่ไฟล์](../00-template-map.md) และ [วิธีย้ายโครง](../05-template.md) ถ้าโจทย์เปลี่ยน schema ให้เปลี่ยน SQL/validation/DTO/status ครบก่อนใช้ runner อาจารย์ ไม่ส่ง schema ตัวอย่างหรือ helpers ทุกตัวโดยไม่อ่านข้อกำหนด เตรียมบัญชี LEB2 และตรวจไฟล์ที่ส่งตามคำสั่งจริง

## Self-check จบบท

- ส่ง 6 งานครบและมี ID ของแถวตัวเอง
- อ่าน Status/Body/DTO และ persistence ได้
- รู้ว่าจะตรวจตรงไหนเมื่อ 400/404/409/500
- หยุด/เริ่ม API และใช้งาน localhost แบบ offline ได้
- พร้อมปรับตามสเปกและส่งผ่าน LEB2

[บท 04](04-contracts.md) · [กลับ GUIDE สำหรับค้นจุดแก้](../../GUIDE.md)
