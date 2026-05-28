import type { AppApi } from '../../main/ipc/types';

declare global {
  interface Window {
    rrllApi: AppApi;
  }
}

export {};
