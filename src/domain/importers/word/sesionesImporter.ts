import mammoth from 'mammoth';
export const previewSesionDocx = async (filePath: string) => (await mammoth.extractRawText({ path: filePath })).value;
