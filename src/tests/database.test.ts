import { describe, expect, it } from 'vitest';
import { initDatabase, checkDatabaseConnection } from '../main/database/database';
import { createBackup } from '../main/backups/backup';
import { upsertSetting, getSetting } from '../domain/repositories/settingsRepository';

describe('database bootstrap', () => {
  it('initializes database and connection', () => {
    const status = initDatabase();
    expect(['Sinc. OK', 'Sinc. ERR']).toContain(status);
    expect(checkDatabaseConnection()).toBe(true);
  });

  it('writes and reads settings', () => {
    upsertSetting('test_key', 'test_value');
    expect(getSetting('test_key')).toBe('test_value');
  });

  it('creates backup file path', () => {
    const backupPath = createBackup('test');
    expect(backupPath.includes('backups')).toBe(true);
  });
});
