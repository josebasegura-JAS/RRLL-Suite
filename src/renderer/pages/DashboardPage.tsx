export const DashboardPage = (): JSX.Element => {
  const cards = ['Tareas pendientes','Peticiones abiertas','Actas pendientes','Próximas sesiones','Estado de sincronización','Último backup'];
  return <section className="cards">{cards.map((c) => <article key={c} className="card"><h3>{c}</h3><p>Dato mock</p></article>)}</section>;
};
