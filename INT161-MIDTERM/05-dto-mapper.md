# 05 — DTO และ Mapper

Entityคือข้อมูลจากDB ส่วนDTOคือรูปข้อมูลตามสัญญาAPI ไม่จำเป็นต้องชื่อfieldหรือจำนวนfieldเท่ากัน Mapperแปลงentityเป็นDTOโดยallowlist

| DB/input | API DTO | ข้อควรตรวจ |
| --- | --- | --- |
| brand_id | brandId | numberตามcontract |
| b.name AS brand_name | brandName | ต้องJOIN ไม่เดาชื่อ |
| price DECIMAL | price | mysql2อาจคืนstring ต้องแปลงตามcontract |
| ram_gb/storage_gb | ramGb/storageGb | number/nullตามschema |
| stock_quantity | stockQuantity | ค่า0ต้องคงอยู่ |
| release_date DATE | releaseDate | YYYY-MM-DDหรือnull |
| internal_cost | ไม่ส่ง | ฟิลด์ภายใน |

## Summary กับ Detail

summaryของWeek08: id,sku,name,brandId,category,price,status

detail: id,sku,name,brandId,brandName,category,price,ramGb,storageGb,color,stockQuantity,status,releaseDate รวม13ฟิลด์

```js
// ตัวอย่างแนวคิดย่อ ไม่ใช่summaryครบทุกฟิลด์
const dto = {id:entity.id, brandId:entity.brand_id, price:Number(entity.price)};
```

โค้ดครบอยู่ [entity-dto-mapper.js](../src/mappers-$id/entity-dto-mapper.js) ใช้ `EntityDtoMapper.maps(items, 'summary')` สำหรับรายการและ `EntityDtoMapper.map(entity, 'full')` สำหรับแถวเดียว

## จุดที่มักพลาด

อย่าreturn `{...entity}` แล้วค่อยลบfieldทีละตัว เพราะคอลัมน์ใหม่อาจหลุด ตรวจnullก่อนmapperเพื่อให้missingเป็น404 ใช้ `??` เมื่ออยากfallbackเฉพาะnull/undefined ไม่ใช้ `||` กับprice/stockที่0ถูกต้อง

DBDATEเก็บวัน ไม่ใช่timestamp kitตั้งdateStringsเพื่อรักษาวันเดิม ส่วนtimestampในenvelopeใช้เวลาปัจจุบันISO UTC

Brandsในใบงานใช้snake_case ไม่ได้หมายความว่าทุกresourceต้องเปลี่ยนเป็นcamelCase ดูresponseของแต่ละendpointเสมอ

ลอง [Read list](../guides/operations/03-read-products.md) และ [Read detail](../guides/operations/04-read-product-detail.md)
