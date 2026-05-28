import { FormEvent, useEffect, useState } from 'react';

export const TicketsPage = (): JSX.Element => {
  const [ausencia, setAusencia] = useState({ numero_empleado:'', tipo_ausencia:'vacaciones', fecha_inicio:'', fecha_fin:'', afecta_ticket:true, origen_importacion:'manual', observaciones:'' });
  const [periodo, setPeriodo] = useState({ inicio:'', fin:'', importe:11 });
  const [resultado, setResultado] = useState<any[]>([]);
  const [computos, setComputos] = useState<any[]>([]);

  const loadComputos = async (): Promise<void> => setComputos(await window.rrllAPI.tickets.listComputos());
  useEffect(() => { void loadComputos(); }, []);

  const importar = async (e: FormEvent): Promise<void> => { e.preventDefault(); await window.rrllAPI.tickets.importAusencia(ausencia); };
  const generar = async (e: FormEvent): Promise<void> => { e.preventDefault(); const data = await window.rrllAPI.tickets.generarComputo(periodo.inicio, periodo.fin, periodo.importe); setResultado(data); await loadComputos(); };

  return <section><h2>Tickets Restaurante</h2>
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
