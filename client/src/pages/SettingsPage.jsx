import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI } from '../services/api';
import './SettingsPage.css';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [apiKey, setApiKey] = useState('');
    const [provider, setProvider] = useState('openai');
    const [hasKey, setHasKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        aiAPI.getConfig().then(config => {
            setProvider(config.provider || 'openai');
            setHasKey(config.hasKey);
        }).catch(() => { });
    }, []);

    async function handleSaveAPI() {
        setSaving(true);
        setMessage('');
        try {
            await aiAPI.setConfig({ apiKey, apiProvider: provider });
            setHasKey(true);
            setMessage('✅ Configuración guardada correctamente');
            setApiKey('');
        } catch (err) {
            setMessage('❌ Error: ' + err.message);
        }
        setSaving(false);
    }

    return (
        <div className="settings-page animate-fade-in">
            <h1 className="page-title">⚙️ Ajustes</h1>

            {/* Profile section */}
            <section className="settings-section glass-card">
                <h2 className="section-title">👤 Perfil</h2>
                <div className="settings-profile">
                    <div className="profile-avatar">
                        {(user?.displayName || user?.username || '?')[0].toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <p className="profile-name">{user?.displayName || user?.username}</p>
                        <p className="profile-email">{user?.email}</p>
                        <p className="profile-joined">Registrado: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'}</p>
                    </div>
                </div>
            </section>

            {/* AI Configuration */}
            <section className="settings-section glass-card">
                <h2 className="section-title">🤖 Configuración de IA</h2>
                <p className="section-desc">
                    Configura tu clave de API para usar el análisis con Inteligencia Artificial.
                    Tu clave se almacena de forma segura en el servidor local.
                </p>

                <div className="ai-config">
                    <div className="input-group">
                        <label className="input-label">Proveedor de IA</label>
                        <div className="provider-selector">
                            <button className={`provider-btn ${provider === 'openai' ? 'provider-btn--active' : ''}`}
                                onClick={() => setProvider('openai')}>
                                <span className="provider-icon">🟢</span> OpenAI
                            </button>
                            <button className={`provider-btn ${provider === 'gemini' ? 'provider-btn--active' : ''}`}
                                onClick={() => setProvider('gemini')}>
                                <span className="provider-icon">🔵</span> Google Gemini
                            </button>
                            <button className={`provider-btn ${provider === 'claude' ? 'provider-btn--active' : ''}`}
                                onClick={() => setProvider('claude')}>
                                <span className="provider-icon">🟪</span> Claude
                            </button>
                            <button className={`provider-btn ${provider === 'ollama' ? 'provider-btn--active' : ''}`}
                                onClick={() => setProvider('ollama')}>
                                <span className="provider-icon">🦙</span> Ollama (Local)
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            {provider === 'ollama' ? 'Modelo de Ollama' : 'API Key'} {hasKey && <span className="key-status">✅ Configurada</span>}
                        </label>
                        <input type={provider === 'ollama' ? 'text' : 'password'} className="input-field"
                            placeholder={hasKey && provider !== 'ollama' ? '••••••••••••••••' :
                                provider === 'ollama' ? 'Ej: llama3.2' : `Ingresa tu ${provider === 'gemini' ? 'Gemini' : provider === 'claude' ? 'Claude' : 'OpenAI'} API Key`}
                            value={apiKey} onChange={e => setApiKey(e.target.value)} />
                        <span className="input-hint">
                            {provider === 'openai' && 'Obtén tu clave en platform.openai.com → API keys'}
                            {provider === 'gemini' && 'Obtén tu clave en aistudio.google.com → API keys'}
                            {provider === 'claude' && 'Obtén tu clave en console.anthropic.com'}
                            {provider === 'ollama' && 'Ingresa el nombre del modelo local (ej. llama3.2). Debe estar descargado en Ollama.'}
                        </span>
                    </div>

                    <button className="btn btn-primary" onClick={handleSaveAPI} disabled={(provider !== 'ollama' && !apiKey) || saving}>
                        {saving ? '⏳ Guardando...' : '💾 Guardar configuración'}
                    </button>

                    {message && <div className="settings-message animate-fade-in">{message}</div>}
                </div>
            </section>

            {/* About */}
            <section className="settings-section glass-card">
                <h2 className="section-title">ℹ️ Acerca de</h2>
                <div className="about-content">
                    <p>
                        <strong>Diario de Emociones</strong> es una herramienta basada en la <em>Terapia Cognitivo-Conductual (TCC)</em>
                        que te ayuda a registrar y analizar tus pensamientos y emociones utilizando el
                        <strong> Registro de Pensamiento de 7 Columnas</strong>.
                    </p>
                    <p style={{ marginTop: '0.75rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        Versión 1.0.0 • Desarrollado con ❤️ usando React, Three.js y Express
                    </p>
                </div>
            </section>

            {/* Logout */}
            <div className="settings-logout">
                <button className="btn btn-danger" onClick={logout}>🚪 Cerrar Sesión</button>
            </div>
        </div>
    );
}
