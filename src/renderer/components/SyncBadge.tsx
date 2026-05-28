import { useEffect, useState } from 'react';

type SyncState = 'Sinc. OK' | 'Sinc. ERR' | 'Espera';

export const SyncBadge = (): JSX.Element => {
  const [status, setStatus] = useState<SyncState>('Espera');
  const [mode, setMode] = useState<'Local'|'Red'>('Local');
  useEffect(() => {
    window.rrllApi.database.getSyncStatus().then((s) => setStatus(s));
    window.rrllApi.database.getMode().then((m) => setMode(m));
  }, []);
  return <span className={`badge ${status === 'Sinc. OK' ? 'ok' : status === 'Sinc. ERR' ? 'err' : 'wait'}`}>{status} · {mode}</span>;
};
