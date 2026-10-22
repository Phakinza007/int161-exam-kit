// ADAPT: class/method names match the teacher template; fields follow the example schema.
export default class EntityDtoMapper {
// ADAPT: แก้allowlist/ชื่อfield/typeตามresponseโจทย์; summaryกับdetailอาจต่างกัน
// brandNameมาจากJOINalias brand_name; ถ้าเปลี่ยนSQLต้องแก้mapperให้ตรงกัน
// Allowlist: ห้าม return {...entity} เพราะคอลัมน์ภายในอาจหลุดออกไป
static toSummaryDTO(entity) {
  return {id:entity.id, sku:entity.sku, name:entity.name, brandId:entity.brand_id,
    category:entity.category, price:Number(entity.price), status:entity.status};
}
static toDetailDTO(entity) {
  return {id:entity.id, sku:entity.sku, name:entity.name, brandId:entity.brand_id,
    brandName:entity.brand_name, category:entity.category, price:Number(entity.price),
    ramGb:entity.ram_gb, storageGb:entity.storage_gb, color:entity.color,
    stockQuantity:entity.stock_quantity, status:entity.status,
    releaseDate:entity.release_date == null ? null : entity.release_date instanceof Date
      ? entity.release_date.toISOString().slice(0,10) : String(entity.release_date)};
}

  static map(entity, viewType = 'full') {
    return viewType === 'summary' ? this.toSummaryDTO(entity) : this.toDetailDTO(entity);
  }
  static maps(entities, viewType = 'summary') {
    return entities.map(entity => this.map(entity, viewType));
  }
}
