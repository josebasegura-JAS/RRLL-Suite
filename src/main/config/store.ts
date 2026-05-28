import Store from 'electron-store';

export interface AppConfig {
  databasePath?: string;
}

export const configStore = new Store<AppConfig>({
  name: 'rrll-dashboard-next-config'
});
