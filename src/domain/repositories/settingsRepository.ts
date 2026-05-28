import { getDbInstance } from '../../main/database/database.js';

export const upsertSetting = (key: string, value: string): void => {
  const now = new Date().toISOString();
  const db = getDbInstance();
  db.prepare(`INSERT INTO settings (key, value, created_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`).run(key, value, now, now);
};

export const getSetting = (key: string): string | null => {
  const row = getDbInstance().prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
};
