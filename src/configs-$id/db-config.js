import mysql from 'mysql2/promise';
export function createDb(config) {
  return mysql.createPool({host:config.host,port:config.port,user:config.user,password:config.password,database:config.database,
    connectionLimit:5,waitForConnections:true,timezone:'Z',dateStrings:['DATE']});
}

// Default export matches the teacher's import db from db-config.js. Pool opens lazily.
import {loadSettings} from './settings.js';
export default createDb(loadSettings());
