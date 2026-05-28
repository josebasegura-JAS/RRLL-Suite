import ExcelJS from 'exceljs';
export const exportRowsToExcel = async (rows: Record<string, unknown>[], filePath: string): Promise<void> => {
  const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet('Datos');
  const headers = Object.keys(rows[0] ?? {}); ws.addRow(headers); rows.forEach((r) => ws.addRow(headers.map((h) => r[h])));
  await wb.xlsx.writeFile(filePath);
};
