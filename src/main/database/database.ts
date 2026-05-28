import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import Database from 'better-sqlite3';
import { app } from 'electron';
import os from 'node:os';
import { configStore } from '../config/store.js';

let db: Database.Database | null = null;
let syncStatus: 'Sinc. OK' | 'Sinc. ERR' | 'Espera' = 'Espera';
let writeQueue = Promise.resolve();

const ensureDir = (target: string): void => { if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true }); };
const getLocalDatabasePath = (): string => { const dir = path.join(app.getPath('userData'), 'data'); ensureDir(dir); return path.join(dir, 'rrll-dashboard-next.sqlite'); };
export const getCurrentDatabaseMode = (): 'Local' | 'Red' => configStore.get('databaseMode') === 'network' ? 'Red' : 'Local';
export const getCurrentDatabasePath = (): string => configStore.get('databasePath') ?? getLocalDatabasePath();
const setDatabasePath = (p: string): void => configStore.set('databasePath', p);
export const getSyncStatus = (): 'Sinc. OK' | 'Sinc. ERR' | 'Espera' => syncStatus;

export const configureSQLiteForMultiUser = (database: Database.Database): void => {
  database.pragma('journal_mode = WAL');
  database.pragma('busy_timeout = 5000');
  database.pragma('foreign_keys = ON');
  database.pragma('synchronous = NORMAL');
};

const openConnection = (databasePath: string): Database.Database => { ensureDir(path.dirname(databasePath)); const conn = new Database(databasePath); configureSQLiteForMultiUser(conn); return conn; };

export const testDatabasePath = (databasePath: string): { ok: boolean; error?: string } => {
  try { const t = openConnection(databasePath); t.prepare('SELECT 1').get(); t.close(); return { ok: true }; } catch (e) { return { ok: false, error: (e as Error).message }; }
};
export const fallbackToLocalDatabase = (reason: string): string => { const local = getLocalDatabasePath(); setDatabasePath(local); configStore.set('databaseMode', 'local'); syncStatus = 'Sinc. ERR'; return `${reason} -> ${local}`; };
export const switchDatabasePath = (databasePath: string): string => {
  const tested = testDatabasePath(databasePath); if (!tested.ok) throw new Error(tested.error ?? 'Ruta no disponible');
  if (db) db.close(); db = openConnection(databasePath); setDatabasePath(databasePath); syncStatus = 'Sinc. OK'; return databasePath;
};
export const setNetworkDatabasePath = (databasePath: string): string => { configStore.set('networkDatabasePath', databasePath); configStore.set('databaseMode', 'network'); return switchDatabasePath(databasePath); };
export const setLocalDatabasePath = (): string => { configStore.set('databaseMode', 'local'); return switchDatabasePath(getLocalDatabasePath()); };

export const initDatabase = (): string => {
  const configuredPath = process.env.VITEST ? path.join(os.tmpdir(), 'rrll-dashboard-next-vitest.sqlite') : getCurrentDatabasePath();
  try { db = openConnection(configuredPath); syncStatus = 'Sinc. OK'; } catch { db = openConnection(getLocalDatabasePath()); syncStatus = 'Sinc. ERR'; }
  const instanceId = configStore.get('instanceId') ?? crypto.randomUUID(); configStore.set('instanceId', instanceId);
  if (process.env.VITEST) db.exec('PRAGMA foreign_keys=OFF; VACUUM; PRAGMA foreign_keys=ON;');
  db.exec('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)');
  const hasV1 = db.prepare('SELECT 1 FROM schema_version WHERE version=1').get();
  if (!hasV1) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (id INTEGER PRIMARY KEY AUTOINCREMENT,key TEXT UNIQUE NOT NULL,value TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT,key TEXT UNIQUE NOT NULL,value TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tareas (id INTEGER PRIMARY KEY AUTOINCREMENT,titulo TEXT NOT NULL,descripcion TEXT,origen TEXT,estado TEXT NOT NULL,prioridad TEXT NOT NULL,fecha_limite TEXT,fecha_creacion TEXT NOT NULL,fecha_actualizacion TEXT NOT NULL,fecha_cierre TEXT,notas TEXT);
    CREATE TABLE IF NOT EXISTS peticiones (id INTEGER PRIMARY KEY AUTOINCREMENT,titulo TEXT NOT NULL,descripcion TEXT,peticionario TEXT,tipo_peticionario TEXT NOT NULL,estado TEXT NOT NULL,prioridad TEXT,fecha_entrada TEXT NOT NULL,fecha_limite TEXT,fecha_cierre TEXT,notas TEXT);
    CREATE TABLE IF NOT EXISTS sesiones_comite (id INTEGER PRIMARY KEY AUTOINCREMENT,fecha TEXT NOT NULL,tipo TEXT,titulo TEXT NOT NULL,estado TEXT NOT NULL,observaciones TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS puntos_comite (id INTEGER PRIMARY KEY AUTOINCREMENT,sesion_id INTEGER NOT NULL,titulo TEXT NOT NULL,descripcion TEXT,peticionario TEXT,orden INTEGER NOT NULL,estado TEXT NOT NULL,acuerdo TEXT,observaciones TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY (sesion_id) REFERENCES sesiones_comite(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS sesiones_paritaria (id INTEGER PRIMARY KEY AUTOINCREMENT,fecha TEXT NOT NULL,titulo TEXT NOT NULL,estado TEXT NOT NULL,observaciones TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS puntos_paritaria (id INTEGER PRIMARY KEY AUTOINCREMENT,sesion_id INTEGER NOT NULL,titulo TEXT NOT NULL,descripcion TEXT,peticionario TEXT,orden INTEGER NOT NULL,estado TEXT NOT NULL,criterio_rd TEXT,acuerdo TEXT,observaciones TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY (sesion_id) REFERENCES sesiones_paritaria(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS actas (id INTEGER PRIMARY KEY AUTOINCREMENT,titulo TEXT NOT NULL,organo TEXT NOT NULL,fecha_reunion TEXT NOT NULL,estado TEXT NOT NULL,sindicatos_alegaciones TEXT,fecha_envio_direccion TEXT,fecha_limite_alegaciones TEXT,fecha_firma TEXT,observaciones TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS teletrabajo_solicitudes (id INTEGER PRIMARY KEY AUTOINCREMENT,numero_empleado TEXT NOT NULL,nombre TEXT NOT NULL,apellidos TEXT NOT NULL,martes INTEGER NOT NULL,miercoles INTEGER NOT NULL,jueves INTEGER NOT NULL,tipo TEXT NOT NULL,estado TEXT NOT NULL,seguridad_informatica_ok INTEGER NOT NULL,prevencion_ok INTEGER NOT NULL,observaciones TEXT,fecha_solicitud TEXT NOT NULL,fecha_resolucion TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tickets_personas (id INTEGER PRIMARY KEY AUTOINCREMENT,numero_empleado TEXT UNIQUE NOT NULL,nombre TEXT NOT NULL,apellidos TEXT NOT NULL,colectivo TEXT,derecho_ticket INTEGER NOT NULL,activo INTEGER NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tickets_calendarios (id INTEGER PRIMARY KEY AUTOINCREMENT,colectivo TEXT NOT NULL,fecha TEXT NOT NULL,es_laborable INTEGER NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tickets_ausencias (id INTEGER PRIMARY KEY AUTOINCREMENT,numero_empleado TEXT NOT NULL,tipo_ausencia TEXT NOT NULL,fecha_inicio TEXT NOT NULL,fecha_fin TEXT NOT NULL,afecta_ticket INTEGER NOT NULL,origen_importacion TEXT,observaciones TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tickets_computos (id INTEGER PRIMARY KEY AUTOINCREMENT,numero_empleado TEXT NOT NULL,periodo_inicio TEXT NOT NULL,periodo_fin TEXT NOT NULL,dias_teoricos INTEGER NOT NULL,dias_ausencia_descuento INTEGER NOT NULL,dias_ticket INTEGER NOT NULL,importe_unitario REAL NOT NULL,importe_total REAL NOT NULL,detalle_json TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS import_logs (id INTEGER PRIMARY KEY AUTOINCREMENT,modulo TEXT NOT NULL,origen TEXT,estado TEXT NOT NULL,resumen TEXT,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS backup_logs (id INTEGER PRIMARY KEY AUTOINCREMENT,path TEXT NOT NULL,reason TEXT NOT NULL,status TEXT NOT NULL,size_bytes INTEGER,created_at TEXT NOT NULL,error_message TEXT);
    CREATE TABLE IF NOT EXISTS error_logs (id INTEGER PRIMARY KEY AUTOINCREMENT,level TEXT NOT NULL,scope TEXT NOT NULL,message TEXT NOT NULL,stack TEXT,context_json TEXT,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS app_events (id INTEGER PRIMARY KEY AUTOINCREMENT,entity TEXT NOT NULL,entity_id TEXT NOT NULL,action TEXT NOT NULL,created_at TEXT NOT NULL,source_instance_id TEXT NOT NULL);
    `);
    db.prepare('INSERT INTO schema_version (version, applied_at) VALUES (1, ?)').run(new Date().toISOString());
  }
  return syncStatus;
};
export const executeWriteOperation = async <T>(name: string, callback: () => T, retries = 3): Promise<T> => {
  const run = async (): Promise<T> => { let attempt = 0; while (true) { try { return callback(); } catch (e) { if ((e as Error).message.includes('SQLITE_BUSY') && attempt < retries) { attempt += 1; await new Promise((r) => setTimeout(r, 150)); continue; } throw new Error(`No se pudo guardar (${name})`); } } };
  writeQueue = writeQueue.then(run);
  return writeQueue as Promise<T>;
};
export const registerAppEvent = (entity: string, entityId: string | number, action: string): void => { if (!db) return; db.prepare('INSERT INTO app_events (entity, entity_id, action, created_at, source_instance_id) VALUES (?, ?, ?, ?, ?)').run(entity, String(entityId), action, new Date().toISOString(), configStore.get('instanceId')); };

export const checkDatabaseIntegrity = (): { integrity: string; quick: string } => { const d = getDbInstance(); return { integrity: d.pragma('integrity_check', { simple: true }) as string, quick: d.pragma('quick_check', { simple: true }) as string }; };
export const vacuumDatabase = (): void => { getDbInstance().exec('VACUUM'); };
export const analyzeDatabase = (): void => { getDbInstance().exec('ANALYZE'); };
export const getDatabaseStats = (): any => ({ path: getCurrentDatabasePath(), mode: getCurrentDatabaseMode(), sizeBytes: fs.existsSync(getCurrentDatabasePath()) ? fs.statSync(getCurrentDatabasePath()).size : 0, syncStatus });
export const getDbInstance = (): Database.Database => { if (!db) throw new Error('Database not initialized'); return db; };
export const checkDatabaseConnection = (): boolean => { try { getDbInstance().prepare('SELECT 1').get(); syncStatus = 'Sinc. OK'; return true; } catch { syncStatus = 'Sinc. ERR'; return false; } };
export const closeDatabase = (): void => { if (db) { db.close(); db = null; } };
