import ExcelJS from 'exceljs';

export const readExcelRows = async (filePath: string): Promise<Record<string, unknown>[]> => {
  const wb = new ExcelJS.Workbook(); await wb.xlsx.readFile(filePath);
  const ws = wb.worksheets[0]; if (!ws) return [];
  const headers = (ws.getRow(1).values as any[]).slice(1).map((x) => String(x ?? '').trim());
  const out: Record<string, unknown>[] = [];
  ws.eachRow((row, n) => { if (n === 1) return; const obj: Record<string, unknown> = {}; headers.forEach((h, i) => obj[h || `col_${i+1}`] = row.getCell(i+1).value as any); out.push(obj); });
  return out;
};
