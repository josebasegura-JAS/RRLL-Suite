import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { app } from 'electron';
import { configStore } from '../config/store.js';

let db: Database.Database | null = null;
let syncStatus: 'Sinc. OK' | 'Sinc. ERR' | 'Espera' = 'Espera';

const ensureDir = (target: string): void => {
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
};

const getLocalDatabasePath = (): string => {
  const dataDir = path.join(app.getPath('userData'), 'data');
  ensureDir(dataDir);
  return path.join(dataDir, 'rrll-dashboard-next.sqlite');
};

export const getDatabasePath = (): string => configStore.get('databasePath') ?? getLocalDatabasePath();

export const setDatabasePath = (databasePath: string): void => {
  configStore.set('databasePath', databasePath);
};

export const getSyncStatus = (): 'Sinc. OK' | 'Sinc. ERR' | 'Espera' => syncStatus;

const openConnection = (databasePath: string): Database.Database => {
  const dir = path.dirname(databasePath);
  ensureDir(dir);
  return new Database(databasePath);
};

export const initDatabase = (): string => {
  const configuredPath = getDatabasePath();
  try {
    db = openConnection(configuredPath);
    syncStatus = 'Sinc. OK';
  } catch {
    const fallbackPath = getLocalDatabasePath();
    db = openConnection(fallbackPath);
    setDatabasePath(fallbackPath);
    syncStatus = 'Sinc. ERR';
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tareas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      origen TEXT,
      estado TEXT NOT NULL,
      prioridad TEXT NOT NULL,
      fecha_limite TEXT,
      fecha_creacion TEXT NOT NULL,
      fecha_actualizacion TEXT NOT NULL,
      fecha_cierre TEXT,
      notas TEXT
    );

    CREATE TABLE IF NOT EXISTS peticiones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      peticionario TEXT,
      tipo_peticionario TEXT NOT NULL,
      estado TEXT NOT NULL,
      prioridad TEXT NOT NULL,
      fecha_entrada TEXT NOT NULL,
      fecha_limite TEXT,
      fecha_cierre TEXT,
      notas TEXT
    );

    CREATE TABLE IF NOT EXISTS sesiones_comite (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL,
      titulo TEXT NOT NULL,
      estado TEXT NOT NULL,
      observaciones TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS puntos_comite (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sesion_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      peticionario TEXT,
      orden INTEGER NOT NULL,
      estado TEXT NOT NULL,
      acuerdo TEXT,
      observaciones TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(sesion_id) REFERENCES sesiones_comite(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sesiones_paritaria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      titulo TEXT NOT NULL,
      estado TEXT NOT NULL,
      observaciones TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS puntos_paritaria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sesion_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      peticionario TEXT,
      orden INTEGER NOT NULL,
      estado TEXT NOT NULL,
      criterio_rd TEXT,
      acuerdo TEXT,
      observaciones TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(sesion_id) REFERENCES sesiones_paritaria(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS actas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      organo TEXT NOT NULL,
      fecha_reunion TEXT NOT NULL,
      estado TEXT NOT NULL,
      sindicatos_alegaciones TEXT,
      fecha_envio_direccion TEXT,
      fecha_limite_alegaciones TEXT,
      fecha_firma TEXT,
      observaciones TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );


    CREATE TABLE IF NOT EXISTS teletrabajo_solicitudes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_empleado TEXT NOT NULL,
      nombre TEXT NOT NULL,
      apellidos TEXT NOT NULL,
      martes INTEGER NOT NULL,
      miercoles INTEGER NOT NULL,
      jueves INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      estado TEXT NOT NULL,
      seguridad_informatica_ok INTEGER NOT NULL,
      prevencion_ok INTEGER NOT NULL,
      observaciones TEXT,
      fecha_solicitud TEXT NOT NULL,
      fecha_resolucion TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets_personas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_empleado TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      apellidos TEXT NOT NULL,
      colectivo TEXT,
      derecho_ticket INTEGER NOT NULL DEFAULT 1,
      activo INTEGER NOT NULL DEFAULT 1,
      observaciones TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets_ausencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_empleado TEXT NOT NULL,
      tipo_ausencia TEXT NOT NULL,
      fecha_inicio TEXT NOT NULL,
      fecha_fin TEXT NOT NULL,
      afecta_ticket INTEGER NOT NULL,
      origen_importacion TEXT,
      observaciones TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(numero_empleado,tipo_ausencia,fecha_inicio,fecha_fin)
    );

    CREATE TABLE IF NOT EXISTS tickets_computos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_empleado TEXT NOT NULL,
      periodo_inicio TEXT NOT NULL,
      periodo_fin TEXT NOT NULL,
      dias_teoricos INTEGER NOT NULL,
      dias_ausencia_descuento INTEGER NOT NULL,
      dias_ticket INTEGER NOT NULL,
      importe_unitario REAL NOT NULL,
      importe_total REAL NOT NULL,
      detalle_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS import_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      archivo TEXT NOT NULL,
      estado TEXT NOT NULL,
      filas_leidas INTEGER NOT NULL,
      filas_importadas INTEGER NOT NULL,
      filas_error INTEGER NOT NULL,
      resumen_json TEXT,
      created_at TEXT NOT NULL
    );

  `);

  return syncStatus;
};

export const checkDatabaseConnection = (): boolean => {
  try {
    if (!db) return false;
    db.prepare('SELECT 1').get();
    syncStatus = 'Sinc. OK';
    return true;
  } catch {
    syncStatus = 'Sinc. ERR';
    return false;
  }
};

export const getDbInstance = (): Database.Database => {
  if (!db) throw new Error('Database not initialized');
  return db;
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
    syncStatus = 'Espera';
  }
};
