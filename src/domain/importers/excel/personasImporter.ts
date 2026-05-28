import { readExcelRows } from './genericExcelReader.js';
export const previewPersonas = async (filePath: string) => readExcelRows(filePath);
