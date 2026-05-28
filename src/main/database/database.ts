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
