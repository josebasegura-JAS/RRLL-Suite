export const mapLegacyTaskToNew = (legacy: any) => ({
  titulo: legacy.titulo ?? legacy.title ?? 'Sin título',
  descripcion: legacy.descripcion ?? legacy.description ?? '',
  estado: legacy.estado ?? 'pendiente',
  prioridad: legacy.prioridad ?? 'media'
});
