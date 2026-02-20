import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
            <div className="login-content">
                <div className="login-illustration-container liquid-shape">
                    <img src="/welcome_illustration.png" alt="Persona meditando" className="login-illustration" />
                </div>

                <div className="login-text-container">
                    <img src="/app_logo.png" alt="Logo" className="login-logo-img liquid-shape" />
                    <h1 className="login-title">Diario de Emociones</h1>
                    <p className="login-subtitle">Tu espacio sagrado para reflexionar, soltar y crecer.</p>

                    <form onSubmit={handleStart} className="login-form">
                        <div className="input-group">
                            <input
                                className="input-field login-input"
                                type="text"
                                placeholder="¿Cuál es tu nombre?"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoFocus
                                maxLength={40}
                            />
                        </div>

                        <button
                            className="btn btn-warm btn-full btn-lg login-btn liquid-btn"
                            type="submit"
                            disabled={!name.trim() || loading}
                        >
                            {loading ? '⏳ Entrando...' : 'Comenzar mi viaje ✨'}
                        </button>
                    </form>

                    <p className="login-quote">{quote}</p>
                </div>
            </div>
        </div>
    );
}
