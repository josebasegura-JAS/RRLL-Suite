import { app, ipcMain } from 'electron';
import path from 'node:path';
import { createBackup } from '../backups/backup.js';
import { analyzeDatabase, checkDatabaseConnection, checkDatabaseIntegrity, fallbackToLocalDatabase, getCurrentDatabaseMode, getCurrentDatabasePath, getDatabaseStats, getSyncStatus, setLocalDatabasePath, setNetworkDatabasePath, switchDatabasePath, testDatabasePath } from '../database/database.js';
import { tareasService } from '../../domain/services/tareasService.js';
import { peticionesService } from '../../domain/services/peticionesService.js';
import { comiteService } from '../../domain/services/comiteService.js';
import { paritariaService } from '../../domain/services/paritariaService.js';
import { actasService } from '../../domain/services/actasService.js';
import { teletrabajoService, ticketsService } from '../../domain/services/phase3Service.js';

export const registerIpc = (): void => {
  ipcMain.handle('db:getPath', () => getCurrentDatabasePath());
  ipcMain.handle('db:getMode', () => getCurrentDatabaseMode());
  ipcMain.handle('db:setNetworkPath', (_e, p: string) => setNetworkDatabasePath(p));
  ipcMain.handle('db:resetLocal', () => setLocalDatabasePath());
  ipcMain.handle('db:testPath', (_e, p: string) => testDatabasePath(p));
  ipcMain.handle('db:switchPath', (_e, p: string) => switchDatabasePath(p));
  ipcMain.handle('db:fallbackLocal', (_e, reason: string) => fallbackToLocalDatabase(reason));
  ipcMain.handle('db:stats', () => getDatabaseStats());
  ipcMain.handle('db:integrity', () => checkDatabaseIntegrity());
  ipcMain.handle('db:analyze', () => analyzeDatabase());
  ipcMain.handle('db:checkConnection', () => checkDatabaseConnection());
  ipcMain.handle('db:createBackup', (_e, reason: string) => createBackup(reason));
  ipcMain.handle('db:getSyncStatus', () => getSyncStatus());
  const crud = (name:string, svc:any) => {
    ipcMain.handle(`${name}:list`, () => svc.list());
    ipcMain.handle(`${name}:getById`, (_e, id:number) => svc.getById(id));
    ipcMain.handle(`${name}:create`, (_e, i:any) => svc.create(i));
    ipcMain.handle(`${name}:update`, (_e, id:number, i:any) => svc.update(id, i));
    ipcMain.handle(`${name}:remove`, (_e, id:number) => svc.remove(id));
    ipcMain.handle(`${name}:search`, (_e, f:any) => svc.search(f));
  };
  crud('tareas', tareasService); crud('peticiones', peticionesService); crud('actas', actasService);
  for (const [n, svc] of [['comite', comiteService], ['paritaria', paritariaService]] as const) {
    ipcMain.handle(`${n}:sessions:list`, () => svc.sessions.list());
    ipcMain.handle(`${n}:sessions:create`, (_e, i:any) => svc.sessions.create(i));
    ipcMain.handle(`${n}:sessions:update`, (_e, id:number, i:any) => svc.sessions.update(id, i));
    ipcMain.handle(`${n}:sessions:remove`, (_e, id:number) => svc.sessions.remove(id));
    ipcMain.handle(`${n}:points:listBySession`, (_e, sid:number) => svc.points.listBySesion(sid));
    ipcMain.handle(`${n}:points:create`, (_e, i:any) => svc.points.create(i));
    ipcMain.handle(`${n}:points:update`, (_e, id:number, i:any) => svc.points.update(id, i));
    ipcMain.handle(`${n}:points:remove`, (_e, id:number) => svc.points.remove(id));
    ipcMain.handle(`${n}:points:reorder`, (_e, sid:number, ids:number[]) => svc.points.reorderPoints(sid, ids));
  }

  ipcMain.handle('teletrabajo:list', () => teletrabajoService.list());
  ipcMain.handle('teletrabajo:create', (_e, i:any) => teletrabajoService.create(i));
  ipcMain.handle('teletrabajo:updateEstado', (_e, id:number, estado:string) => teletrabajoService.updateEstado(id, estado));
  ipcMain.handle('tickets:importAusencia', (_e, i:any) => ticketsService.importAusencia(i));
  ipcMain.handle('tickets:generarComputo', (_e, inicio:string, fin:string, unit:number) => ticketsService.generarComputo(inicio, fin, unit));

  ipcMain.handle('dashboard:stats', async () => ({
    tareasPendientes: tareasService.search({ estado: 'pendiente' }).length,
    tareasEnCurso: tareasService.search({ estado: 'en_curso' }).length,
    peticionesPendientes: peticionesService.search({ estado: 'pendiente' }).length,
    peticionesEnCurso: peticionesService.search({ estado: 'en_curso' }).length,
    actasPendientes: actasService.search({ estado: 'pendiente_hacer' }).length,
    proximasComite: comiteService.sessions.list().filter((x:any) => x.estado === 'prevista').slice(0, 5),
    proximasParitaria: paritariaService.sessions.list().filter((x:any) => x.estado === 'prevista').slice(0, 5),
    teletrabajoPendiente: teletrabajoService.list().filter((x:any)=>x.estado==='pendiente').length,
    teletrabajoAprobada: teletrabajoService.list().filter((x:any)=>x.estado==='aprobada').length
  }));
};
