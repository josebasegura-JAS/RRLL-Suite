import mammoth from 'mammoth';
export const previewActaDocx = async (filePath: string) => (await mammoth.extractRawText({ path: filePath })).value;
