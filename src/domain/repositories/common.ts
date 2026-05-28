import { getDbInstance } from '../../main/database/database.js';
export const db = () => getDbInstance();
export const nowIso = () => new Date().toISOString();
