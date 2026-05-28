import { NavLink, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { ConfigPage } from '../pages/ConfigPage';
import { SyncBadge } from '../components/SyncBadge';
import { CrudPage } from '../pages/CrudPage';
import { SessionsPage } from '../pages/SessionsPage';
import { TeletrabajoPage } from '../pages/TeletrabajoPage';
import { TicketsPage } from '../pages/TicketsPage';

const sections = ['Dashboard','Tareas','Peticiones','Comité de Empresa','Comisión Paritaria','Actas','Teletrabajo','Tickets Restaurante','Configuración'];

export const MainLayout = (): JSX.Element => (
  <div className="layout">
    <aside className="sidebar"><h2>RRLL Dashboard Next</h2>{sections.map((item) => <NavLink key={item} to={item === 'Dashboard' ? '/' : `/${encodeURIComponent(item)}`}>{item}</NavLink>)}</aside>
    <div className="content"><header><h1>RRLL Dashboard Next</h1><SyncBadge /></header><main><Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/Configuración" element={<ConfigPage />} />
      <Route path="/Teletrabajo" element={<TeletrabajoPage />} />
      <Route path={`/${encodeURIComponent('Tickets Restaurante')}`} element={<TicketsPage />} />

      <Route path="/Tareas" element={<CrudPage title="Tareas" api={window.rrllAPI.tareas} defaults={{ titulo:'', descripcion:'', estado:'pendiente', prioridad:'media' }} statuses={['pendiente','en_curso','cerrada']} />} />
      <Route path="/Peticiones" element={<CrudPage title="Peticiones" api={window.rrllAPI.peticiones} defaults={{ titulo:'', descripcion:'', estado:'pendiente', prioridad:'media', tipo_peticionario:'empresa' }} statuses={['pendiente','en_curso','cerrada']} />} />
      <Route path="/Actas" element={<CrudPage title="Actas" api={window.rrllAPI.actas} defaults={{ titulo:'', descripcion:'', estado:'pendiente_hacer', organo:'comite', fecha_reunion:new Date().toISOString().slice(0,10) }} statuses={['pendiente_hacer','en_revision','firmada']} />} />
      <Route path={`/${encodeURIComponent('Comité de Empresa')}`} element={<SessionsPage title="Comité de Empresa" api={window.rrllAPI.comite} />} />
      <Route path={`/${encodeURIComponent('Comisión Paritaria')}`} element={<SessionsPage title="Comisión Paritaria" api={window.rrllAPI.paritaria} />} />
    </Routes></main></div>
  </div>
);
