import { createBackup } from '../backups/backup.js';
import { loggerService } from '../services/loggerService.js';
import { mapLegacyTaskToNew } from './legacyMapper.js';
import { detectLegacyFormat, readLegacyData } from './legacyReader.js';

export const migrationService = {
  preview(filePath: string) {
    const format = detectLegacyFormat(filePath);
    const data = readLegacyData(filePath);
    return { format, keys: Object.keys(data ?? {}), modules: ['tareas', 'peticiones', 'comite', 'paritaria', 'actas', 'teletrabajo', 'tickets'] };
  },
  migratePartial(filePath: string, modules: string[]) {
    createBackup('before_migration');
    const data = readLegacyData(filePath);
    const tareas = Array.isArray(data?.tareas) ? data.tareas.map(mapLegacyTaskToNew) : [];
    loggerService.log('info', 'migration', 'Migración parcial ejecutada', { filePath, modules, tareas: tareas.length });
    return { ok: true, modules, imported: { tareas: tareas.length } };
  }
};
