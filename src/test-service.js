// Optional read-only smoke check, matching the teacher ZIP filename.
import * as service from './services-$id/service.js';
import db from './configs-$id/db-config.js';
try { console.log(await service.getAllObjects()); }
finally { await db.end(); }
