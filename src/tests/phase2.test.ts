import { describe,it,expect } from 'vitest';
import { initDatabase } from '../main/database/database';
import { tareasService } from '../domain/services/tareasService';
import { peticionesService } from '../domain/services/peticionesService';
import { comiteService } from '../domain/services/comiteService';
import { actasService } from '../domain/services/actasService';

describe('phase2 core',()=>{it('tareas CRUD cerrar',()=>{initDatabase();const t=tareasService.create({titulo:'t1',estado:'pendiente',prioridad:'media'});expect(t.id).toBeTruthy();const u=tareasService.update(t.id,{estado:'cerrada'});expect(u?.fecha_cierre).toBeTruthy();expect(tareasService.list().length).toBeGreaterThan(0);});
it('peticiones CRUD cerrar',()=>{const p=peticionesService.create({titulo:'p1',estado:'pendiente',prioridad:'alta',tipo_peticionario:'empresa'});const u=peticionesService.update(p.id,{estado:'cerrada'});expect(u?.fecha_cierre).toBeTruthy();});
it('comite sesión y puntos + reorder',()=>{const s:any=comiteService.sessions.create({fecha:new Date().toISOString(),tipo:'ordinario',titulo:'s',estado:'prevista'});const p1:any=comiteService.points.create({sesion_id:s.id,titulo:'a',orden:1,estado:'pendiente'});const p2:any=comiteService.points.create({sesion_id:s.id,titulo:'b',orden:2,estado:'pendiente'});const r:any[]=comiteService.points.reorderPoints(s.id,[p2.id,p1.id]);expect(r[0].id).toBe(p2.id);});
it('acta y estado',()=>{const a:any=actasService.create({titulo:'acta',organo:'comite',fecha_reunion:new Date().toISOString(),estado:'pendiente_hacer'});const u:any=actasService.update(a.id,{estado:'firmada'});expect(u.estado).toBe('firmada');});
it('validación',()=>{expect(()=>tareasService.create({estado:'pendiente',prioridad:'media'} as any)).toThrow();});});
