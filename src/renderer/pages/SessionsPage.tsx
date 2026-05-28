import { useEffect, useState } from 'react';

export const SessionsPage = ({ title, api }: any): JSX.Element => {
  const [sessions, setSessions] = useState<any[]>([]); const [points, setPoints] = useState<any[]>([]);
  const [q, setQ] = useState(''); const [sid, setSid] = useState<number | null>(null);
  const [sTitle, setSTitle] = useState(''); const [pTitle, setPTitle] = useState('');
  const refresh = async () => setSessions((await api.sessions.list()).filter((s:any)=>`${s.titulo} ${s.observaciones??''}`.toLowerCase().includes(q.toLowerCase())));
  useEffect(()=>{refresh();},[q]); useEffect(()=>{if(sid)api.points.listBySession(sid).then(setPoints);},[sid]);
  return <section><h2>{title}</h2><input placeholder='Buscar sesión' value={q} onChange={e=>setQ(e.target.value)} />
  <div><input placeholder='Título sesión' value={sTitle} onChange={e=>setSTitle(e.target.value)} /><button onClick={async()=>{await api.sessions.create({fecha:new Date().toISOString(),titulo:sTitle,estado:'prevista'});setSTitle('');refresh();}}>Crear sesión</button></div>
  <ul>{sessions.map((s:any)=><li key={s.id}><button onClick={()=>setSid(s.id)}>Abrir</button> {s.titulo} ({s.estado})
   <button onClick={()=>api.sessions.update(s.id,{estado:s.estado==='prevista'?'cerrada':'prevista'}).then(refresh)}>Cambiar estado</button>
   <button onClick={()=>api.sessions.remove(s.id).then(refresh)}>Eliminar</button></li>)}</ul>
  {sid && <div><h3>Puntos sesión {sid}</h3><input value={pTitle} onChange={e=>setPTitle(e.target.value)} /><button onClick={async()=>{await api.points.create({sesion_id:sid,titulo:pTitle,orden:points.length+1,estado:'pendiente'});setPTitle('');setPoints(await api.points.listBySession(sid));}}>Añadir punto</button>
  <ul>{points.map((p:any)=><li key={p.id}>{p.titulo} ({p.estado}) <button onClick={async()=>{await api.points.update(p.id,{titulo:`${p.titulo}*`});setPoints(await api.points.listBySession(sid));}}>Editar</button><button onClick={async()=>{await api.points.remove(p.id);setPoints(await api.points.listBySession(sid));}}>Eliminar</button></li>)}</ul></div>}
  </section>;
};
