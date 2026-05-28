import { db } from './common.js';
import type { CreateInput, Tarea, UpdateInput } from '../types/entities.js';
export const tareasRepository={
list:():Tarea[]=>db().prepare('SELECT * FROM tareas ORDER BY fecha_creacion DESC').all() as Tarea[],
getById:(id:number):Tarea|undefined=>db().prepare('SELECT * FROM tareas WHERE id=?').get(id) as Tarea|undefined,
create:(input:CreateInput<Tarea>):Tarea=>{const r=db().prepare(`INSERT INTO tareas (titulo,descripcion,origen,estado,prioridad,fecha_limite,fecha_creacion,fecha_actualizacion,fecha_cierre,notas) VALUES (@titulo,@descripcion,@origen,@estado,@prioridad,@fecha_limite,@fecha_creacion,@fecha_actualizacion,@fecha_cierre,@notas)`).run(input as any);return tareasRepository.getById(Number(r.lastInsertRowid))!;},
update:(id:number,input:UpdateInput<Tarea>):Tarea|undefined=>{const entries=Object.entries(input);if(!entries.length)return tareasRepository.getById(id);db().prepare(`UPDATE tareas SET ${entries.map(([k])=>`${k}=@${k}`).join(',')} WHERE id=@id`).run({id,...input} as any);return tareasRepository.getById(id);},
remove:(id:number):void=>{db().prepare('DELETE FROM tareas WHERE id=?').run(id);},
search:(f:{q?:string;estado?:string;prioridad?:string}):Tarea[]=>{const w=['1=1'];const p:any={};if(f.q){w.push('(titulo LIKE @q OR descripcion LIKE @q OR notas LIKE @q)');p.q=`%${f.q}%`;}if(f.estado){w.push('estado=@estado');p.estado=f.estado;}if(f.prioridad){w.push('prioridad=@prioridad');p.prioridad=f.prioridad;}return db().prepare(`SELECT * FROM tareas WHERE ${w.join(' AND ')} ORDER BY fecha_creacion DESC`).all(p) as Tarea[];}
};
