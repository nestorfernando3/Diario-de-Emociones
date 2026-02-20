import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import EmotionOrb from '../components/three/EmotionOrb';
import './LoginPage.css';

const QUOTES = [
    '"Conocerse a uno mismo es el principio de toda sabiduría." — Aristóteles',
    '"Las emociones no se pueden eliminar; solo se pueden transformar." — Carl Jung',
    '"No podemos controlar el viento, pero sí las velas." — Jimmy Dean',
    '"El que tiene un porqué puede soportar cualquier cómo." — Nietzsche',
    '"La felicidad no es la ausencia de problemas, sino la capacidad de tratar con ellos." — Steve Maraboli',
];

export default function LoginPage() {
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await register(form);
            } else {
                await login({ username: form.username, password: form.password });
            }
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    return (
        <div className="login-page">
            <EmotionOrb />
            <div className="login-container animate-fade-in-scale">
                <div className="login-card glass-card">
                    <div className="login-header">
                        <div className="login-logo">🌈</div>
                        <h1 className="login-title">Diario de Emociones</h1>
                        <p className="login-subtitle">
                            {isRegister ? 'Crea tu espacio personal' : 'Bienvenido de vuelta'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label className="input-label">Usuario</label>
                            <input className="input-field" type="text" placeholder="tu_usuario"
                                value={form.username} onChange={handleChange('username')} required />
                        </div>

                        {isRegister && (
                            <>
                                <div className="input-group animate-fade-in-up">
                                    <label className="input-label">Nombre</label>
                                    <input className="input-field" type="text" placeholder="Tu nombre"
                                        value={form.displayName} onChange={handleChange('displayName')} />
                                </div>
                                <div className="input-group animate-fade-in-up delay-100">
                                    <label className="input-label">Email</label>
                                    <input className="input-field" type="email" placeholder="correo@ejemplo.com"
                                        value={form.email} onChange={handleChange('email')} required />
                                </div>
                            </>
                        )}

                        <div className="input-group">
                            <label className="input-label">Contraseña</label>
                            <input className="input-field" type="password" placeholder="••••••••"
                                value={form.password} onChange={handleChange('password')} required minLength={6} />
                        </div>

                        {error && <div className="login-error animate-fade-in">{error}</div>}

                        <button className="btn btn-primary btn-lg login-btn" type="submit" disabled={loading}>
                            {loading ? '⏳' : isRegister ? '🚀 Crear cuenta' : '✨ Entrar'}
                        </button>
                    </form>

                    <div className="login-toggle">
                        <span className="login-toggle-text">
                            {isRegister ? '¿Ya tienes cuenta?' : '¿Primera vez aquí?'}
                        </span>
                        <button className="btn btn-ghost" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                            {isRegister ? 'Inicia sesión' : 'Regístrate'}
                        </button>
                    </div>

                    <div className="login-quote">{quote}</div>
                </div>
            </div>
        </div>
    );
}
