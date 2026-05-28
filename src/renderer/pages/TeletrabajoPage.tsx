import { FormEvent, useEffect, useState } from 'react';

type Estado = 'pendiente' | 'aprobada' | 'denegada' | 'reabierta';

export const TeletrabajoPage = (): JSX.Element => {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ numero_empleado:'', nombre:'', apellidos:'', martes:true, miercoles:false, jueves:false, tipo:'ordinario', observaciones:'' });

  const load = async (): Promise<void> => setItems(await window.rrllAPI.teletrabajo.list());
  useEffect(() => { void load(); }, []);

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    await window.rrllAPI.teletrabajo.create({ ...form, estado:'pendiente', seguridad_informatica_ok:true, prevencion_ok:true, fecha_solicitud:new Date().toISOString().slice(0,10) });
    setForm({ numero_empleado:'', nombre:'', apellidos:'', martes:true, miercoles:false, jueves:false, tipo:'ordinario', observaciones:'' });
    await load();
  };

  const updateEstado = async (id:number, estado:Estado): Promise<void> => { await window.rrllAPI.teletrabajo.updateEstado(id, estado); await load(); };

  return <section><h2>Teletrabajo</h2>
    <form onSubmit={(e) => void submit(e)}>
      <input placeholder="Nº empleado" value={form.numero_empleado} onChange={(e)=>setForm({...form,numero_empleado:e.target.value})} required />
      <input placeholder="Nombre" value={form.nombre} onChange={(e)=>setForm({...form,nombre:e.target.value})} required />
      <input placeholder="Apellidos" value={form.apellidos} onChange={(e)=>setForm({...form,apellidos:e.target.value})} required />
      <button type="submit">Crear solicitud</button>
    </form>
    <ul>{items.map((x)=><li key={x.id}>{x.numero_empleado} - {x.nombre} {x.apellidos} ({x.estado})
      <button onClick={() => void updateEstado(x.id, 'aprobada')}>Aprobar</button>
      <button onClick={() => void updateEstado(x.id, 'denegada')}>Denegar</button>
      <button onClick={() => void updateEstado(x.id, 'reabierta')}>Reabrir</button>
    </li>)}</ul>
  </section>;
};
