import db from '../configs-$id/db-config.js';
// ADAPT: เปลี่ยนtable/column/PK/FK/WHERE/JOINตรงschemaโจทย์; bindค่าด้วย? เสมอ
// list และ COUNT ต้องใช้filterเดียวกัน; string/composite keyอยู่ด้านล่างสำหรับหยิบใช้เมื่อจำเป็น
// ตาราง/คอลัมน์เป็น source code ที่แก้ตาม schema; ? ใช้กับค่าข้อมูล
const PRODUCT_SELECT = `SELECT p.id,p.sku,p.name,p.brand_id,b.name AS brand_name,
 p.category,p.price,p.ram_gb,p.storage_gb,p.color,p.stock_quantity,p.status,p.release_date
 FROM products p JOIN brands b ON b.id=p.brand_id`;
export function createRepository(db) {
  async function one(sql, values) {const [rows]=await db.query(sql,values);return rows[0] || null;}
  return {
    async listBrands(){const [rows]=await db.query('SELECT id,name,country_of_origin,website,is_active,created_at FROM brands ORDER BY id');return rows;},
    findBrand:id=>one('SELECT id,name,country_of_origin,website,is_active,created_at FROM brands WHERE id=?',[id]),
    async removeBrand(id){const [result]=await db.query('DELETE FROM brands WHERE id=?',[id]);return result.affectedRows;},
    async findAll(pagination){const values=pagination?[pagination.limit,pagination.offset]:[];const [rows]=await db.query(PRODUCT_SELECT+' ORDER BY p.id'+(pagination?' LIMIT ? OFFSET ?':''),values);return rows;},
    async countAll(){const [[{total}]]=await db.query('SELECT COUNT(*) AS total FROM products');return Number(total);},
    findOne:id=>one(PRODUCT_SELECT+' WHERE p.id=?',[id]),
    findBySku:sku=>one('SELECT id FROM products WHERE sku=?',[sku]),
    async create(data){const [result]=await db.query('INSERT INTO products SET ?',[data]);return result.insertId;},
    async update(id,data){await db.query('UPDATE products SET ? WHERE id=?',[data,id]);},
    async remove(id){const [result]=await db.query('DELETE FROM products WHERE id=?',[id]);return result.affectedRows;},
    async listTags(){const [rows]=await db.query('SELECT code,label FROM tags ORDER BY code');return rows;},
    findTag:code=>one('SELECT code,label FROM tags WHERE code=?',[code]),
    async createTag(data){await db.query('INSERT INTO tags SET ?',[data]);},
    async updateTag(code,label){await db.query('UPDATE tags SET label=? WHERE code=?',[label,code]);},
    async removeTag(code){const [result]=await db.query('DELETE FROM tags WHERE code=?',[code]);return result.affectedRows;},
    async listProductTags(id){const [rows]=await db.query('SELECT t.code,t.label FROM product_tags pt JOIN tags t ON t.code=pt.tag_code WHERE pt.product_id=? ORDER BY t.code',[id]);return rows;},
    async createProductTag(id,code){await db.query('INSERT INTO product_tags(product_id,tag_code) VALUES(?,?)',[id,code]);},
    async removeProductTag(id,code){const [result]=await db.query('DELETE FROM product_tags WHERE product_id=? AND tag_code=?',[id,code]);return result.affectedRows;},
  };
}

// Factory above only supports isolated tests; ordinary template imports use these named exports.
const repository = createRepository(db);
export const findAll = (...args) => repository.findAll(...args);
export const countAll = (...args) => repository.countAll(...args);
export const findOne = (...args) => repository.findOne(...args);
export const findBySku = (...args) => repository.findBySku(...args);
export const create = (...args) => repository.create(...args);
export const update = (...args) => repository.update(...args);
export const remove = (...args) => repository.remove(...args);
export const listBrands = (...args) => repository.listBrands(...args);
export const findBrand = (...args) => repository.findBrand(...args);
export const removeBrand = (...args) => repository.removeBrand(...args);
export const listTags = (...args) => repository.listTags(...args);
export const findTag = (...args) => repository.findTag(...args);
export const createTag = (...args) => repository.createTag(...args);
export const updateTag = (...args) => repository.updateTag(...args);
export const removeTag = (...args) => repository.removeTag(...args);
export const listProductTags = (...args) => repository.listProductTags(...args);
export const createProductTag = (...args) => repository.createProductTag(...args);
export const removeProductTag = (...args) => repository.removeProductTag(...args);
