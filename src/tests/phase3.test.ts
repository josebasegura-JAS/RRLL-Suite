import { beforeAll, describe, expect, it } from 'vitest';
import { app } from 'electron';
import { initDatabase, getDbInstance } from '../main/database/database.js';
import { teletrabajoService, ticketsService } from '../domain/services/phase3Service.js';

describe('phase3', () => {
  beforeAll(() => { if (!app.isReady()) return; initDatabase(); });

  it('teletrabajo approve/deny/reopen', () => {
    const t = teletrabajoService.create({ numero_empleado: '1', nombre: 'A', apellidos: 'B', martes: true, miercoles: false, jueves: false, tipo: 'nuevo', estado: 'pendiente', seguridad_informatica_ok: true, prevencion_ok: true, fecha_solicitud: '2026-01-01' }) as any;
    expect(teletrabajoService.updateEstado(t.id, 'aprobada').fecha_resolucion).toBeTruthy();
    expect(teletrabajoService.updateEstado(t.id, 'denegada').estado).toBe('denegada');
    expect(teletrabajoService.updateEstado(t.id, 'en_revision').fecha_resolucion).toBeNull();
  });

  it('tickets computo con rangos y afecta', () => {
    const db = getDbInstance();
    db.prepare("INSERT OR IGNORE INTO tickets_personas (numero_empleado,nombre,apellidos,colectivo,derecho_ticket,activo,created_at,updated_at) VALUES ('E1','N','A','X',1,1,datetime('now'),datetime('now'))").run();
    ticketsService.importAusencia({ numero_empleado: 'E1', tipo_ausencia: 'vacaciones', fecha_inicio: '2026-01-02', fecha_fin: '2026-01-04', afecta_ticket: true });
    ticketsService.importAusencia({ numero_empleado: 'E1', tipo_ausencia: 'permiso', fecha_inicio: '2026-01-05', fecha_fin: '2026-01-05', afecta_ticket: false });
    const c: any = ticketsService.generarComputo('2026-01-01','2026-01-10',10)[0];
    expect(c.dias_ausencia_descuento).toBe(3);
  });
});
