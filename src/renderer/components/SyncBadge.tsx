import { useEffect, useState } from 'react';

type SyncState = 'Sinc. OK' | 'Sinc. ERR' | 'Espera';

export const SyncBadge = (): JSX.Element => {
  const [status, setStatus] = useState<SyncState>('Espera');
  useEffect(() => {
    window.rrllApi.database.getSyncStatus().then((s) => setStatus(s));
  }, []);
  return <span className={`badge ${status === 'Sinc. OK' ? 'ok' : status === 'Sinc. ERR' ? 'err' : 'wait'}`}>{status}</span>;
};
