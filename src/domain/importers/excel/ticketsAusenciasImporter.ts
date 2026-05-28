import { readExcelRows } from './genericExcelReader.js';
export const normalizeExcelDate = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') return new Date(Math.round((value - 25569) * 86400 * 1000)).toISOString().slice(0,10);
  return String(value).slice(0,10);
};
export const previewTicketsAusencias = async (filePath: string) => readExcelRows(filePath);
