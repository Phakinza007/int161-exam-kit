// ADAPT: default page/limit, maxlimit และinvalid-query policyตามโจทย์ ไม่ยึดค่าตัวอย่างเสมอ
import { AppError } from './app-error.js';
function positiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new AppError('page and limit must be positive integers');
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) throw new AppError('page and limit must be positive integers');
  return n;
}
export function parsePagination(query = {}) {
  const page = positiveInteger(query.page, 1);
  const limit = Math.min(positiveInteger(query.limit, 10), 100);
  const offset = (page - 1) * limit;
  if (!Number.isSafeInteger(offset)) throw new AppError('Requested page is too large');
  return {page, limit, offset};
}
export function queryParser() {
 return function(req, res, next) {
  try { req.pagination = parsePagination(req.query); next(); } catch (err) { next(err); }
 };
}
