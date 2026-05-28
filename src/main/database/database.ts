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
