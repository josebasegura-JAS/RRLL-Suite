import { describe, expect, it } from 'vitest';
import { createBackup, deleteOldBackups, listBackups, restoreBackup } from '../main/backups/backup';
import { checkDatabaseIntegrity, executeWriteOperation, fallbackToLocalDatabase, initDatabase, registerAppEvent, setLocalDatabasePath, testDatabasePath } from '../main/database/database';
import { loggerService } from '../main/services/loggerService';
import { detectLegacyFormat } from '../main/migration/legacyReader';
import { mapLegacyTaskToNew } from '../main/migration/legacyMapper';

describe('phase4 basics', () => {
  it('db path and fallback', () => {
    initDatabase();
    expect(testDatabasePath(setLocalDatabasePath()).ok).toBe(true);
    expect(fallbackToLocalDatabase('test').includes('test')).toBe(true);
  });

  it('integrity and app events', async () => {
    initDatabase();
    const integrity = checkDatabaseIntegrity();
    expect(integrity.quick).toContain('ok');
    await executeWriteOperation('event_insert', () => registerAppEvent('tareas', 1, 'create'));
  });

  it('backup lifecycle', () => {
    const backup = createBackup('manual');
    expect(listBackups().length).toBeGreaterThan(0);
    expect(restoreBackup(backup)).toBe(true);
    expect(deleteOldBackups()).toBeGreaterThanOrEqual(0);
  });

  it('logger works', () => {
    loggerService.log('error', 'test', 'error message');
    expect(loggerService.listRecent(5).length).toBeGreaterThan(0);
    expect(loggerService.exportLogs('json')).toContain('error message');
  });

  it('migration helpers', () => {
    expect(detectLegacyFormat('legacy.json')).toBe('json');
    const mapped = mapLegacyTaskToNew({ title: 'Old task' });
    expect(mapped.titulo).toBe('Old task');
  });
});
