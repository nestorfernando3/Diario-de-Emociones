import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EmotionOrb } from '../components/three/EmotionOrb';
import './LoginPage.css';

const QUOTES = [
    '"No podemos controlar el viento, pero sí las velas." — Jimmy Dean',
    '"El coraje no es la ausencia de miedo, sino el juicio de que hay algo más importante." — Ambrose Redmoon',
    '"Cuídate a ti mismo primero. No puedes servir desde un recipiente vacío." — Eleanor Brownn',
    '"Las emociones son información, no órdenes." — Susan David',
];

export default function LoginPage() {
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];

    async function handleStart(e) {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        await login({ displayName: name.trim() });
        setLoading(false);
    }

    return (
        <div className="login-page">
            <div className="login-orb-bg">
                <EmotionOrb />
            </div>

            <div className="login-container">
                <div className="glass-card login-card">
                    <div className="login-logo">🌈</div>
                    <h1 className="login-title">Diario de Emociones</h1>
                    <p className="login-subtitle">¿Cómo te llamo?</p>

                    <form onSubmit={handleStart} className="login-form">
                        <div className="input-group">
                            <label className="input-label">Tu nombre</label>
                            <input
                                className="input-field"
                                type="text"
                                placeholder="Ej. Néstor"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoFocus
                                maxLength={40}
                            />
                        </div>

                        <button
                            className="btn btn-primary btn-full"
                            type="submit"
                            disabled={!name.trim() || loading}
                        >
                            {loading ? '⏳ Entrando...' : '✨ Comenzar'}
                        </button>

                        <p style={{
                            textAlign: 'center',
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.75rem'
                        }}>
                            🔒 Tus datos se guardan solo en este dispositivo
                        </p>
                    </form>

                    <p className="login-quote">"{quote}"</p>
                </div>
            </div>
        </div>
    );
}
