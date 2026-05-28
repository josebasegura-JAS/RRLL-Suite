import { z } from 'zod';

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const teletrabajoEstadoSchema = z.enum(['pendiente', 'en_revision', 'aprobada', 'denegada', 'archivada']);
export const teletrabajoTipoSchema = z.enum(['nuevo', 'renovacion']);

export const teletrabajoSchema = z.object({
  numero_empleado: z.string().min(1), nombre: z.string().min(1), apellidos: z.string().min(1),
  martes: z.boolean(), miercoles: z.boolean(), jueves: z.boolean(),
  tipo: teletrabajoTipoSchema, estado: teletrabajoEstadoSchema,
  seguridad_informatica_ok: z.boolean(), prevencion_ok: z.boolean(),
  observaciones: z.string().optional().default(''), fecha_solicitud: isoDate,
  fecha_resolucion: isoDate.nullable().optional()
});

export const ticketAusenciaSchema = z.object({
  numero_empleado: z.string().min(1), tipo_ausencia: z.string().min(1), fecha_inicio: isoDate, fecha_fin: isoDate,
  afecta_ticket: z.boolean(), origen_importacion: z.string().default('manual'), observaciones: z.string().optional().default('')
}).refine((v) => v.fecha_inicio <= v.fecha_fin, { message: 'fecha_inicio debe ser <= fecha_fin' });

export const ticketComputoSchema = z.object({
  numero_empleado: z.string().min(1), dias_teoricos: z.number().min(0), dias_ausencia_descuento: z.number().min(0), dias_ticket: z.number().min(0), importe_unitario: z.number().min(0), importe_total: z.number().min(0)
});
