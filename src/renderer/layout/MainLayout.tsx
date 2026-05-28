import { NavLink, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { ConfigPage } from '../pages/ConfigPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { SyncBadge } from '../components/SyncBadge';

const sections = ['Dashboard','Tareas','Peticiones','Comité de Empresa','Comisión Paritaria','Actas','Teletrabajo','Tickets Restaurante','Configuración'];

export const MainLayout = (): JSX.Element => (
  <div className="layout">
    <aside className="sidebar"><h2>RRLL Dashboard Next</h2>{sections.map((item) => <NavLink key={item} to={item === 'Dashboard' ? '/' : `/${encodeURIComponent(item)}`}>{item}</NavLink>)}</aside>
    <div className="content"><header><h1>RRLL Dashboard Next</h1><SyncBadge /></header><main><Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/Configuración" element={<ConfigPage />} />
      {sections.filter((item) => !['Dashboard', 'Configuración'].includes(item)).map((item) => <Route key={item} path={`/${encodeURIComponent(item)}`} element={<PlaceholderPage title={item} />} />)}
    </Routes></main></div>
  </div>
);
