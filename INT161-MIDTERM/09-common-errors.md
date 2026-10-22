# 09 — Common Errors

## เช็กจากอาการหนึ่งจุดก่อน

| อาการ | จุดแรกที่ตรวจ |
| --- | --- |
| Cannot use import outside a module | package.jsonมีtype:module |
| require is not defined | ใช้import/exportให้ตรงESM |
| ERR_MODULE_NOT_FOUND | relativepath/.js/ชื่อfolderและตัวพิมพ์ตรงไฟล์จริง |
| เปิด API ไม่ขึ้น | ใช้ npm start ที่เรียก src/app.js ตรวจ .env/MySQL และ error ใน Terminal |
| EADDRINUSE | serverเดิมใช้portอยู่ ปิดตัวเดิมหรือเปลี่ยนPORT |
| ECONNREFUSED | MySQLเปิดอยู่และhost/portถูก |
| ER_ACCESS_DENIED_ERROR | user/passwordใน.envถูก |
| Unknown database | ตั้งฐานฝึกแล้วรันdb:init ไม่ชี้ฐานสอบ |
| marker missing | หยุดใช้ฐานนั้น เลือกฐานฝึกใหม่ที่ยังไม่มี |
| 404ทุกendpoint | basepathรหัสคงที่/method/portตรงกัน |
| req.body undefined | Content-Type JSON และexpress.jsonอยู่ก่อนrouter |
| ได้Promiseแทนข้อมูล | awaitDB/serviceก่อนใช้ผล |
| SELECTได้arrayซ้อน/undefined | mysql2คืน[rows,fields] ต้องdestructure |
| summaryหลุดfieldอื่น | mapperใช้allowlist ไม่spreadentity |
| priceเป็นstring | แปลงตามcontractในmapper |
| stock0กลายเป็นdefault | ใช้??เมื่อ0ถูกต้อง |
| brandNameไม่มี | SQLJOINและalias brand_nameตรงmapper |
| วันที่เลื่อนวัน | ตรวจdateStrings/timezoneและDATEเทียบtimestamp |
| page2ยังได้ข้อมูลเดิม | offset=(page-1)*normalizedlimit |
| totalเท่าจำนวนในหน้า | ใช้COUNTของข้อมูลทั้งหมดตามfilter |
| PUTค่าเดิมได้404 | อย่าใช้changedRows0ตัดสินmissing |
| แก้/ลบหลายแถว | WHEREและparamsครบ โดยเฉพาะcompositekey |
| NAกลายเป็นNaN | stringPKห้ามNumber/parseInt |
| duplicateหลุด500 | handlerต้องmapER_DUP_ENTRY409 |
| errorกลับเป็นHTML | handler4argumentsอยู่ท้ายapp และส่งต่อerrorถูก |
| HTTP200แต่bodyบอก404 | ตั้งres.statusจริง |
| DELETE204แต่แนบJSON | ใช้res.status(204).end() |
| responseตรงแต่runnerไม่ผ่าน | เทียบfield/type/status/basepathกับสเปกเฉพาะตัว |

## ลำดับตรวจข้อสอบ

1. อ่านmethod/path/body/status/DTOจากโจทย์ ไม่เริ่มแก้หลายlayerพร้อมกัน
2. ส่งrequestที่เล็กที่สุดจากlocalhost ดูstatus/rawbody
3. ดูlogในเครื่องและจุดthrow/error code โดยไม่เผยpassword
4. SELECTแถวในฐานที่ตั้งไว้ ตรวจpersistenceและFK/UNIQUE
5. แก้ที่ชั้นต้นเหตุ แล้วส่งrequestเดิมและกรณีข้างเคียงอีกครั้ง

ก่อนสอบเตรียมเอกสาร .md/.js และdependenciesในเครื่อง เปิดMySQL ลองตัดอินเทอร์เน็ตจริง ใช้[checklistก่อนส่ง](../guides/06-offline.md)

ตัวช่วย `npm run doctor` อ่านข้อมูลอย่างเดียว ส่วน `npm run db:init` และ `npm test` เขียนฐานฝึก ห้ามนำไปรันกับฐานสอบจริง
