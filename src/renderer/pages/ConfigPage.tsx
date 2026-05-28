import { useEffect, useState } from 'react';

export const ConfigPage = (): JSX.Element => {
  const [path, setPath] = useState('');
  const [mode, setMode] = useState<'Local'|'Red'>('Local');
  const [message, setMessage] = useState('');

  const refresh = async () => { setPath(await window.rrllApi.database.getPath()); setMode(await window.rrllApi.database.getMode()); };
  useEffect(() => { refresh(); }, []);
  return <section><h2>Configuración</h2><p>Ruta activa: {path}</p><p>Modo: {mode}</p>
    <button onClick={async () => { const res = await window.rrllApi.database.testPath(path); setMessage(res.ok ? 'Sinc. OK' : `Sinc. ERR: ${res.error}`); }}>Comprobar ruta activa</button>
    <button onClick={async () => { const p = prompt('Ruta de red SQLite'); if (!p) return; await window.rrllApi.database.setNetworkPath(p); await refresh(); setMessage('Sinc. OK (Red)'); }}>Configurar base en red</button>
    <button onClick={async () => { await window.rrllApi.database.resetLocal(); await refresh(); setMessage('Local activo'); }}>Volver a base local</button>
    <button onClick={async () => setMessage(`Backup: ${await window.rrllApi.database.createBackup('manual')}`)}>Crear backup manual</button>
    <p>{message}</p></section>;
};
