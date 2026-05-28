export const requireText = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`${field} es obligatorio`);
  return value;
};
export const oneOf = <T extends string>(value: unknown, field: string, allowed: readonly T[]): T => {
  if (typeof value !== 'string' || !allowed.includes(value as T)) throw new Error(`${field} inválido`);
  return value as T;
};
