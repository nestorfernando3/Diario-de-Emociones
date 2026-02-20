import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { entriesAPI } from '../services/api';
import { IconNote, IconCalendar, IconFlame, IconHeart, IconLightbulb, IconSparkles, IconPencil } from '../components/icons/AppIcons';
import EmotionConstellation from '../components/three/EmotionConstellation';
import './DashboardPage.css';

const GREETINGS = ['¡Hola', '¡Bienvenido', '¡Qué gusto verte'];
const TIPS = [
    'Registrar tus pensamientos te ayuda a identificar patrones emocionales.',
    'No se trata de "pensar en positivo", sino de pensar de forma realista.',
    'Dedica 15 minutos al día a reflexionar sobre tus emociones.',
    'Cada registro te acerca más al autoconocimiento.',
    'La evidencia debe ser hechos, no otros sentimientos.',
];

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [stats, setStats] = useState({ total: 0, thisMonth: 0, streak: 0, avgIntensity: 0 });
    const [loading, setLoading] = useState(true);
    const [greeting] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const now = new Date();
            const allEntries = await entriesAPI.list({});
            const monthEntries = await entriesAPI.list({
                month: now.getMonth() + 1,
                year: now.getFullYear()
            });

            setEntries(allEntries);

            // Calculate streak
            let streak = 0;
            const today = new Date().toISOString().split('T')[0];
            const dates = [...new Set(allEntries.map(e => e.entry_date))].sort().reverse();
            for (let i = 0; i < dates.length; i++) {
                const expected = new Date();
                expected.setDate(expected.getDate() - i);
                const expectedStr = expected.toISOString().split('T')[0];
                if (dates[i] === expectedStr) streak++;
                else break;
            }

            // Avg intensity
            const avgIntensity = allEntries.length > 0
                ? Math.round(allEntries.reduce((a, e) => a + (e.feeling_intensity || 0), 0) / allEntries.length)
                : 0;

            setStats({
                total: allEntries.length,
                thisMonth: monthEntries.length,
                streak,
                avgIntensity,
            });
        } catch (err) {
            console.error('Error loading dashboard:', err);
        }
        setLoading(false);
    }

    const recentEntries = entries.slice(0, 5);

    const EMOTION_COLORS = {
        'Alegría': '#fbbf24', 'Tristeza': '#3b82f6', 'Enojo': '#ef4444',
        'Miedo': '#7c3aed', 'Sorpresa': '#f97316', 'Asco': '#84cc16',
        'Calma': '#34d399', 'Amor': '#ec4899',
    };

    return (
        <div className="dashboard animate-fade-in">
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-greeting">{greeting}, {user?.displayName || user?.username}!</h1>
                    <p className="dashboard-date">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button className="btn btn-warm btn-lg" onClick={() => navigate('/new-entry')}>
                    <IconPencil size={18} color="white" /> Nueva Reflexión
                </button>
            </header>

            {/* Tip Banner */}
            <div className="tip-card glass-card">
                <div className="tip-icon"><IconLightbulb size={24} color="var(--primary-500)" /></div>
                <div className="tip-content">
                    <h3 className="tip-title">Consejo del día</h3>
                    <p>{tip}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <span className="stat-icon"><IconNote size={28} color="var(--primary-400)" /></span>
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Registros</span>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon"><IconCalendar size={28} color="var(--warm-400)" /></span>
                    <span className="stat-value">{stats.thisMonth}</span>
                    <span className="stat-label">Este mes</span>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon"><IconFlame size={28} color="var(--emotion-anger)" /></span>
                    <span className="stat-value">{stats.streak}</span>
                    <span className="stat-label">Días seguidos</span>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon"><IconHeart size={28} color="var(--emotion-love)" /></span>
                    <span className="stat-value">{stats.avgIntensity}%</span>
                    <span className="stat-label">Intensidad Prom.</span>
                </div>
            </div>

            {/* Constellation */}
            <section className="dashboard-section">
                <h2 className="section-title">Tu Constelación Emocional</h2>
                <p className="section-desc">Cada estrella es un registro. Explora tu universo emocional en 3D.</p>
                <EmotionConstellation entries={entries} onEntryClick={(e) => navigate('/calendar')} />
            </section>

            {/* Recent entries */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Registros Recientes</h2>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/calendar')}>Ver todos →</button>
                </div>
                {loading ? (
                    <div className="loading-placeholder animate-pulse">Cargando...</div>
                ) : recentEntries.length === 0 ? (
                    <div className="empty-state glass-card">
                        <span className="empty-icon">🌱</span>
                        <p>Aún no tienes registros</p>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/new-entry')}>
                            Crear tu primer registro
                        </button>
                    </div>
                ) : (
                    <div className="entries-list">
                        {recentEntries.map((entry, i) => (
                            <div key={entry.id} className="entry-card glass-card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                                <div className="entry-color-bar" style={{ background: EMOTION_COLORS[entry.feeling] || entry.mood_color }} />
                                <div className="entry-content">
                                    <div className="entry-top">
                                        <span className="entry-feeling" style={{ color: EMOTION_COLORS[entry.feeling] || entry.mood_color }}>
                                            {entry.feeling}
                                        </span>
                                        <span className="entry-date">{entry.entry_date}</span>
                                    </div>
                                    <p className="entry-situation">{entry.situation}</p>
                                    <div className="entry-intensity">
                                        <div className="intensity-bar">
                                            <div className="intensity-fill" style={{
                                                width: `${entry.feeling_intensity}%`,
                                                background: EMOTION_COLORS[entry.feeling] || entry.mood_color
                                            }} />
                                        </div>
                                        <span className="intensity-value">{entry.feeling_intensity}%</span>
                                        {entry.re_rating != null && (
                                            <span className="intensity-rerating">→ {entry.re_rating}%</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
