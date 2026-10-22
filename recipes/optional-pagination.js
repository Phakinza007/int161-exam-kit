import {parsePagination} from '../src/middlewares-$id/pagination-middleware.js';
// Use ONLY when the written contract says unpaginated response is allowed.
export function parseOptionalPagination(query){
 if(query.page===undefined && query.limit===undefined)return null;
 return parsePagination(query);
}
