export type SyncState = 'Sinc. OK' | 'Sinc. ERR' | 'Espera';

export interface AppApi {
  database: {
    getPath: () => Promise<string>;
    setPath: (path: string) => Promise<void>;
    resetLocal: () => Promise<string>;
    checkConnection: () => Promise<boolean>;
    createBackup: (reason: string) => Promise<string>;
    getSyncStatus: () => Promise<SyncState>;
  };
}
