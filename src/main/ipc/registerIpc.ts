import { app, ipcMain } from 'electron';
import path from 'node:path';
import { createBackup } from '../backups/backup.js';
import { checkDatabaseConnection, getDatabasePath, getSyncStatus, setDatabasePath } from '../database/database.js';

export const registerIpc = (): void => {
  ipcMain.handle('db:getPath', () => getDatabasePath());
  ipcMain.handle('db:setPath', (_e, newPath: string) => setDatabasePath(newPath));
  ipcMain.handle('db:resetLocal', () => {
    const localPath = path.join(app.getPath('userData'), 'data', 'rrll-dashboard-next.sqlite');
    setDatabasePath(localPath);
    return localPath;
  });
  ipcMain.handle('db:checkConnection', () => checkDatabaseConnection());
  ipcMain.handle('db:createBackup', (_e, reason: string) => createBackup(reason));
  ipcMain.handle('db:getSyncStatus', () => getSyncStatus());
};
