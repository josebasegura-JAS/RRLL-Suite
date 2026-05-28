import fs from 'node:fs';
import path from 'node:path';
import { closeDatabase, getCurrentDatabasePath, getDbInstance, initDatabase } from '../database/database.js';

const stamp = () => new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
const backupDir = (): string => path.join(path.dirname(getCurrentDatabasePath()), 'backups');
const ensure = (): void => { if (!fs.existsSync(backupDir())) fs.mkdirSync(backupDir(), { recursive: true }); };

export const createBackup = (reason: string): string => {
  ensure();
  const out = path.join(backupDir(), `rrll-dashboard-next_${stamp()}_${reason}.sqlite`);
  fs.copyFileSync(getCurrentDatabasePath(), out);
  getDbInstance().prepare('INSERT INTO backup_logs (path, reason, status, size_bytes, created_at) VALUES (?, ?, ?, ?, ?)').run(out, reason, 'ok', fs.statSync(out).size, new Date().toISOString());
  return out;
};
export const listBackups = (): string[] => fs.existsSync(backupDir()) ? fs.readdirSync(backupDir()).filter((f) => f.endsWith('.sqlite')).map((f) => path.join(backupDir(), f)).sort().reverse() : [];
export const restoreBackup = (backupPath: string): boolean => {
  createBackup('pre_restore');
  closeDatabase(); fs.copyFileSync(backupPath, getCurrentDatabasePath()); initDatabase();
  return true;
};
export const deleteOldBackups = (): number => {
  const files = listBackups(); if (files.length <= 30) return 0;
  const deletables = files.slice(30).filter((f) => !path.basename(f).includes('_manual.'));
  for (const file of deletables) fs.unlinkSync(file);
  return deletables.length;
};
