import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { IconHome, IconCalendar, IconPencil, IconBrain, IconSettings, IconLogout } from '../icons/AppIcons';
import './Layout.css';

const NAV_ITEMS = [
    { path: '/dashboard', Icon: IconHome, label: 'Inicio' },
    { path: '/calendar', Icon: IconCalendar, label: 'Calendario' },
    { path: '/new-entry', Icon: IconPencil, label: 'Registrar' },
    { path: '/analysis', Icon: IconBrain, label: 'Análisis IA' },
    { path: '/settings', Icon: IconSettings, label: 'Ajustes' },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/app_logo.png" alt="Logo" className="sidebar-logo-img" />
                    <h2 className="sidebar-title">Diario</h2>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(item => (
                        <NavLink key={item.path} to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
                            <span className="nav-icon"><item.Icon size={20} /></span>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar liquid-shape">
                            {(user?.displayName || user?.username || '?')[0].toUpperCase()}
                        </div>
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{user?.displayName || user?.username}</span>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={logout} title="Cambiar usuario">
                        <IconLogout size={16} />
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
