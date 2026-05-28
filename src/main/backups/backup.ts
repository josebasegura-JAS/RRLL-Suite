import fs from 'node:fs';
import path from 'node:path';
import { getDatabasePath } from '../database/database.js';

export const createBackup = (reason: string): string => {
  const databasePath = getDatabasePath();
  const backupDir = path.join(path.dirname(databasePath), 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${stamp}-${reason}.sqlite`);
  fs.copyFileSync(databasePath, backupPath);
  return backupPath;
};
