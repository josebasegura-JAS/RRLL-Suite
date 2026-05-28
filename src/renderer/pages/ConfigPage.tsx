import { useEffect, useState } from 'react';

export const ConfigPage = (): JSX.Element => {
  const [path, setPath] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { window.rrllApi.database.getPath().then(setPath); }, []);
  return <section><h2>Configuración</h2><p>Ruta actual: {path}</p>
    <button onClick={() => setMessage('Pendiente selector de archivo')}>Seleccionar base de datos</button>
    <button onClick={async () => setPath(await window.rrllApi.database.resetLocal())}>Volver a base local</button>
    <button onClick={async () => setMessage((await window.rrllApi.database.checkConnection()) ? 'Sinc. OK' : 'Sinc. ERR')}>Comprobar conexión</button>
    <button onClick={async () => setMessage(`Backup: ${await window.rrllApi.database.createBackup('manual')}`)}>Crear backup ahora</button>
    <p>{message}</p></section>;
};
