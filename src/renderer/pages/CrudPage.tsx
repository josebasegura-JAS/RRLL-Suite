import { useEffect, useState } from 'react';

export const CrudPage = ({ title, api, defaults, statuses }: any): JSX.Element => {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<any>(defaults);
  const [editingId, setEditingId] = useState<number | null>(null);
  const refresh = async () => setItems(await api.search({ q }));
  useEffect(() => { refresh(); }, [q]);
  const save = async () => { editingId ? await api.update(editingId, form) : await api.create(form); setForm(defaults); setEditingId(null); refresh(); };
  return <section><h2>{title}</h2>
    <input placeholder="Buscar" value={q} onChange={(e)=>setQ(e.target.value)} />
    <div><input placeholder="Título" value={form.titulo ?? ''} onChange={(e)=>setForm({...form,titulo:e.target.value})} />
    <textarea placeholder="Descripción" value={form.descripcion ?? ''} onChange={(e)=>setForm({...form,descripcion:e.target.value})} />
    <select value={form.estado} onChange={(e)=>setForm({...form,estado:e.target.value})}>{statuses.map((s:string)=><option key={s}>{s}</option>)}</select>
    <button onClick={save}>{editingId ? 'Guardar' : 'Crear'}</button></div>
    <ul>{items.map((x)=><li key={x.id}><b>{x.titulo}</b> ({x.estado})
      <button onClick={()=>{setEditingId(x.id);setForm(x);}}>Editar</button>
      <button onClick={()=>api.remove(x.id).then(refresh)}>Eliminar</button>
      <button onClick={()=>api.update(x.id,{estado: statuses[(statuses.indexOf(x.estado)+1)%statuses.length]}).then(refresh)}>Cambiar estado</button>
    </li>)}</ul></section>;
};
