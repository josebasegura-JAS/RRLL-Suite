import fs from 'node:fs';

export const detectLegacyFormat = (filePath: string): 'json' | 'sqlite' | 'unknown' => {
  if (filePath.endsWith('.json')) return 'json';
  if (filePath.endsWith('.sqlite') || filePath.endsWith('.db')) return 'sqlite';
  return 'unknown';
};

export const readLegacyData = (filePath: string): any => {
  const format = detectLegacyFormat(filePath);
  if (format === 'json') return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return { format, raw: null };
};
