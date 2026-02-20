import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

const NAV_ITEMS = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/calendar', icon: '📅', label: 'Calendario' },
    { path: '/new-entry', icon: '✍️', label: 'Nuevo Registro' },
    { path: '/analysis', icon: '🤖', label: 'Análisis IA' },
    { path: '/settings', icon: '⚙️', label: 'Ajustes' },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="app-layout">
            <aside className="sidebar glass-card">
                <div className="sidebar-header">
                    <img src="/app_logo.png" alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                    <h2 className="sidebar-title">Diario</h2>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(item => (
                        <NavLink key={item.path} to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {(user?.displayName || user?.username || '?')[0].toUpperCase()}
                        </div>
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{user?.displayName || user?.username}</span>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={logout} title="Cambiar Nombre">✏️</button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
