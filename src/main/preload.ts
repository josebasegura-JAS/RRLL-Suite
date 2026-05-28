import { contextBridge, ipcRenderer } from 'electron';
import type { AppApi } from './ipc/types.js';

const api: AppApi = {
  database: {
    getPath: () => ipcRenderer.invoke('db:getPath'),
    setPath: (path) => ipcRenderer.invoke('db:setPath', path),
    resetLocal: () => ipcRenderer.invoke('db:resetLocal'),
    checkConnection: () => ipcRenderer.invoke('db:checkConnection'),
    createBackup: (reason) => ipcRenderer.invoke('db:createBackup', reason),
    getSyncStatus: () => ipcRenderer.invoke('db:getSyncStatus')
  }
};

contextBridge.exposeInMainWorld('rrllApi', api);
