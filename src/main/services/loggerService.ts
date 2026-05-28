import { getDbInstance } from '../database/database.js';

export type LogLevel = 'info' | 'warning' | 'error' | 'critical';

export const loggerService = {
  log(level: LogLevel, scope: string, message: string, context?: unknown, stack?: string): void {
    try {
      const db = getDbInstance();
      db.prepare(`INSERT INTO error_logs (level, scope, message, stack, context_json, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(level, scope, message, stack ?? null, context ? JSON.stringify(context) : null, new Date().toISOString());
    } catch {}
  },
  listRecent(limit = 50): any[] {
    const db = getDbInstance();
    return db.prepare('SELECT * FROM error_logs ORDER BY id DESC LIMIT ?').all(limit);
  },
  exportLogs(format: 'json' | 'txt' = 'json'): string {
    const logs = this.listRecent(500);
    return format === 'json' ? JSON.stringify(logs, null, 2) : logs.map((l) => `[${l.created_at}] ${l.level} ${l.scope}: ${l.message}`).join('\n');
  }
};
