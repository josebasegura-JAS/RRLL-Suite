import { getDbInstance } from '../../main/database/database.js';
import { teletrabajoSchema, ticketAusenciaSchema } from '../schemas/phase3Schemas.js';

const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

export const teletrabajoService = {
  list: () => getDbInstance().prepare('SELECT * FROM teletrabajo_solicitudes ORDER BY id DESC').all(),
  create: (input: any) => {
    const p = teletrabajoSchema.parse({ ...input, fecha_resolucion: input.fecha_resolucion ?? null });
    const db = getDbInstance();
    const r = db.prepare(`INSERT INTO teletrabajo_solicitudes (numero_empleado,nombre,apellidos,martes,miercoles,jueves,tipo,estado,seguridad_informatica_ok,prevencion_ok,observaciones,fecha_solicitud,fecha_resolucion,created_at,updated_at) VALUES (@numero_empleado,@nombre,@apellidos,@martes,@miercoles,@jueves,@tipo,@estado,@seguridad_informatica_ok,@prevencion_ok,@observaciones,@fecha_solicitud,@fecha_resolucion,@created_at,@updated_at)`).run({ ...p, created_at: now(), updated_at: now() });
    return db.prepare('SELECT * FROM teletrabajo_solicitudes WHERE id=?').get(r.lastInsertRowid);
  },
  updateEstado: (id: number, estado: string) => {
    const fecha_resolucion = (estado === 'aprobada' || estado === 'denegada') ? today() : null;
    getDbInstance().prepare('UPDATE teletrabajo_solicitudes SET estado=?, fecha_resolucion=?, updated_at=? WHERE id=?').run(estado, fecha_resolucion, now(), id);
    return getDbInstance().prepare('SELECT * FROM teletrabajo_solicitudes WHERE id=?').get(id);
  }
};

const eachDay = (start: string, end: string): string[] => {
  const out: string[] = []; const d = new Date(start + 'T00:00:00Z'); const e = new Date(end + 'T00:00:00Z');
  while (d <= e) { out.push(d.toISOString().slice(0,10)); d.setUTCDate(d.getUTCDate()+1); }
  return out;
};

export const ticketsService = {
  importAusencia: (input: any) => {
    const parsed = ticketAusenciaSchema.parse({ ...input, fecha_fin: input.fecha_fin ?? input.fecha_inicio });
    const db = getDbInstance();
    const existing = db.prepare('SELECT id FROM tickets_ausencias WHERE numero_empleado=? AND tipo_ausencia=? AND fecha_inicio=? AND fecha_fin=?').get(parsed.numero_empleado, parsed.tipo_ausencia, parsed.fecha_inicio, parsed.fecha_fin) as any;
    if (existing) {
      db.prepare('UPDATE tickets_ausencias SET afecta_ticket=?, origen_importacion=?, observaciones=?, updated_at=? WHERE id=?').run(parsed.afecta_ticket ? 1 : 0, parsed.origen_importacion, parsed.observaciones, now(), existing.id);
      return { action: 'updated', id: existing.id };
    }
    const r = db.prepare('INSERT INTO tickets_ausencias (numero_empleado,tipo_ausencia,fecha_inicio,fecha_fin,afecta_ticket,origen_importacion,observaciones,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').run(parsed.numero_empleado, parsed.tipo_ausencia, parsed.fecha_inicio, parsed.fecha_fin, parsed.afecta_ticket ? 1 : 0, parsed.origen_importacion, parsed.observaciones, now(), now());
    return { action: 'inserted', id: r.lastInsertRowid };
  },
  generarComputo: (periodo_inicio: string, periodo_fin: string, importe_unitario = 11) => {
    const db = getDbInstance();
    const personas = db.prepare('SELECT * FROM tickets_personas WHERE derecho_ticket=1 AND activo=1').all() as any[];
    const ausencias = db.prepare('SELECT * FROM tickets_ausencias').all() as any[];
    const teoricos = eachDay(periodo_inicio, periodo_fin).length;
    const res = personas.map((p) => {
      const diasAus = new Set<string>();
      for (const a of ausencias.filter((x) => x.numero_empleado === p.numero_empleado && x.afecta_ticket === 1)) {
        for (const day of eachDay(a.fecha_inicio, a.fecha_fin)) if (day >= periodo_inicio && day <= periodo_fin) diasAus.add(day);
      }
      const dias_ausencia_descuento = diasAus.size; const dias_ticket = Math.max(0, teoricos - dias_ausencia_descuento);
      const importe_total = dias_ticket * importe_unitario;
      db.prepare('INSERT INTO tickets_computos (numero_empleado,periodo_inicio,periodo_fin,dias_teoricos,dias_ausencia_descuento,dias_ticket,importe_unitario,importe_total,detalle_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(p.numero_empleado, periodo_inicio, periodo_fin, teoricos, dias_ausencia_descuento, dias_ticket, importe_unitario, importe_total, JSON.stringify({ diasAusencia: [...diasAus] }), now(), now());
      return { numero_empleado: p.numero_empleado, dias_ausencia_descuento, dias_ticket, importe_total };
    });
    return res;
  }
};


export const ticketsQueries = {
  listComputos: () => getDbInstance().prepare('SELECT * FROM tickets_computos ORDER BY id DESC LIMIT 100').all()
};


export const ticketsPersonasService = {
  list: () => getDbInstance().prepare('SELECT * FROM tickets_personas ORDER BY activo DESC, apellidos ASC, nombre ASC').all(),
  create: (input: any) => {
    const db = getDbInstance();
    const payload = {
      numero_empleado: String(input.numero_empleado ?? '').trim(),
      nombre: String(input.nombre ?? '').trim(),
      apellidos: String(input.apellidos ?? '').trim(),
      colectivo: String(input.colectivo ?? '').trim(),
      derecho_ticket: input.derecho_ticket ? 1 : 0,
      activo: input.activo === undefined ? 1 : (input.activo ? 1 : 0)
    };
    const r = db.prepare('INSERT INTO tickets_personas (numero_empleado,nombre,apellidos,colectivo,derecho_ticket,activo,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').run(payload.numero_empleado, payload.nombre, payload.apellidos, payload.colectivo, payload.derecho_ticket, payload.activo, now(), now());
    return db.prepare('SELECT * FROM tickets_personas WHERE id=?').get(r.lastInsertRowid);
  },
  update: (id: number, input: any) => {
    const db = getDbInstance();
    const current = db.prepare('SELECT * FROM tickets_personas WHERE id=?').get(id) as any;
    if (!current) return null;
    const next = {
      numero_empleado: String(input.numero_empleado ?? current.numero_empleado).trim(),
      nombre: String(input.nombre ?? current.nombre).trim(),
      apellidos: String(input.apellidos ?? current.apellidos).trim(),
      colectivo: String(input.colectivo ?? current.colectivo ?? '').trim(),
      derecho_ticket: input.derecho_ticket === undefined ? current.derecho_ticket : (input.derecho_ticket ? 1 : 0),
      activo: input.activo === undefined ? current.activo : (input.activo ? 1 : 0)
    };
    db.prepare('UPDATE tickets_personas SET numero_empleado=?, nombre=?, apellidos=?, colectivo=?, derecho_ticket=?, activo=?, updated_at=? WHERE id=?').run(next.numero_empleado, next.nombre, next.apellidos, next.colectivo, next.derecho_ticket, next.activo, now(), id);
    return db.prepare('SELECT * FROM tickets_personas WHERE id=?').get(id);
  },
  remove: (id: number) => {
    getDbInstance().prepare('DELETE FROM tickets_personas WHERE id=?').run(id);
  }
};
