import Store from 'electron-store';

export interface AppConfig {
  databasePath?: string;
  networkDatabasePath?: string;
  databaseMode?: 'local' | 'network';
  instanceId?: string;
}

export const configStore = new Store<AppConfig>({
  name: 'rrll-dashboard-next-config'
});
