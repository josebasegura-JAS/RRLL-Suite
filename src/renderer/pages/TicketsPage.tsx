import { FormEvent, useEffect, useState } from 'react';

export const TicketsPage = (): JSX.Element => {
  const [ausencia, setAusencia] = useState({ numero_empleado:'', tipo_ausencia:'vacaciones', fecha_inicio:'', fecha_fin:'', afecta_ticket:true, origen_importacion:'manual', observaciones:'' });
  const [periodo, setPeriodo] = useState({ inicio:'', fin:'', importe:11 });
  const [persona, setPersona] = useState({ numero_empleado:'', nombre:'', apellidos:'', colectivo:'', derecho_ticket:true, activo:true });
  const [resultado, setResultado] = useState<any[]>([]);
  const [computos, setComputos] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);

  const loadComputos = async (): Promise<void> => setComputos(await window.rrllAPI.tickets.listComputos());
  const loadPersonas = async (): Promise<void> => setPersonas(await window.rrllAPI.tickets.personas.list());
  useEffect(() => { void loadComputos(); void loadPersonas(); }, []);

  const importar = async (e: FormEvent): Promise<void> => { e.preventDefault(); await window.rrllAPI.tickets.importAusencia(ausencia); };
  const generar = async (e: FormEvent): Promise<void> => { e.preventDefault(); const data = await window.rrllAPI.tickets.generarComputo(periodo.inicio, periodo.fin, periodo.importe); setResultado(data); await loadComputos(); };
  const crearPersona = async (e: FormEvent): Promise<void> => { e.preventDefault(); await window.rrllAPI.tickets.personas.create(persona); setPersona({ numero_empleado:'', nombre:'', apellidos:'', colectivo:'', derecho_ticket:true, activo:true }); await loadPersonas(); };

  return <section><h2>Tickets Restaurante</h2>
    <form onSubmit={(e)=>void crearPersona(e)}><h3>Alta de persona con derecho a ticket</h3>
      <input placeholder="Nº empleado" value={persona.numero_empleado} onChange={(e)=>setPersona({...persona,numero_empleado:e.target.value})} required />
      <input placeholder="Nombre" value={persona.nombre} onChange={(e)=>setPersona({...persona,nombre:e.target.value})} required />
      <input placeholder="Apellidos" value={persona.apellidos} onChange={(e)=>setPersona({...persona,apellidos:e.target.value})} required />
      <input placeholder="Colectivo" value={persona.colectivo} onChange={(e)=>setPersona({...persona,colectivo:e.target.value})} />
      <label><input type="checkbox" checked={persona.derecho_ticket} onChange={(e)=>setPersona({...persona,derecho_ticket:e.target.checked})} /> derecho_ticket</label>
      <label><input type="checkbox" checked={persona.activo} onChange={(e)=>setPersona({...persona,activo:e.target.checked})} /> activo</label>
      <button type="submit">Crear persona</button>
    </form>
    <h3>Personas activas</h3>
    <ul>{personas.filter((p)=>p.activo===1).map((p)=><li key={p.id}>{p.numero_empleado} - {p.nombre} {p.apellidos} ({p.colectivo || 'sin colectivo'}) · derecho_ticket: {p.derecho_ticket===1?'sí':'no'}</li>)}</ul>

    <form onSubmit={(e)=>void importar(e)}><h3>Importar ausencia manual</h3>
      <input placeholder="Nº empleado" value={ausencia.numero_empleado} onChange={(e)=>setAusencia({...ausencia,numero_empleado:e.target.value})} required />
      <input type="date" value={ausencia.fecha_inicio} onChange={(e)=>setAusencia({...ausencia,fecha_inicio:e.target.value})} required />
      <input type="date" value={ausencia.fecha_fin} onChange={(e)=>setAusencia({...ausencia,fecha_fin:e.target.value})} required />
      <button type="submit">Importar</button>
    </form>
    <form onSubmit={(e)=>void generar(e)}><h3>Generar cómputo por periodo</h3>
      <input type="date" value={periodo.inicio} onChange={(e)=>setPeriodo({...periodo,inicio:e.target.value})} required />
      <input type="date" value={periodo.fin} onChange={(e)=>setPeriodo({...periodo,fin:e.target.value})} required />
      <input type="number" value={periodo.importe} onChange={(e)=>setPeriodo({...periodo,importe:Number(e.target.value)})} />
      <button type="submit">Generar</button>
    </form>
    <h3>Resultado</h3><pre>{JSON.stringify(resultado, null, 2)}</pre>
    <h3>Computos básicos</h3><ul>{computos.map((c)=><li key={c.id}>{c.numero_empleado}: {c.dias_ticket} días / {c.importe_total} €</li>)}</ul>
  </section>;
};
