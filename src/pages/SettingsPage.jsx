import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI } from '../services/api';
import { syncAPI } from '../services/syncAPI';
import './SettingsPage.css';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [apiKey, setApiKey] = useState('');
    const [provider, setProvider] = useState('openai');
    const [hasKey, setHasKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [syncKey, setSyncKey] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        aiAPI.getConfig().then(config => {
            setProvider(config.provider || 'openai');
            setHasKey(config.hasKey);
        }).catch(() => { });

        const storedKey = localStorage.getItem('diario_sync_key');
        if (storedKey) {
            setSyncKey(storedKey);
            setIsConnected(true);
        }
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

    async function handleConnect() {
        if (!syncKey) {
            setMessage('❌ Por favor, ingresa una llave para conectarte.');
            return;
        }
        setSyncing(true);
        setMessage('');
        try {
            await syncAPI.download(syncKey);
            localStorage.setItem('diario_sync_key', syncKey);
            setIsConnected(true);
            setMessage('✅ Conectado a la nube. Datos sincronizados correctamente. Recargando...');
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setMessage('❌ Error al conectar: ' + err.message);
        }
        setSyncing(false);
    }

    async function handleSetupNewSync() {
        setSyncing(true);
        setMessage('');
        try {
            // Se asume que no hay llave previa; upload genera una nueva
            const newKey = await syncAPI.upload(null);
            setSyncKey(newKey);
            localStorage.setItem('diario_sync_key', newKey);
            setIsConnected(true);
            setMessage('✅ Nube enlazada. Guarda esta nueva llave maestra en un lugar seguro.');
        } catch (err) {
            setMessage('❌ Error al crear enlace: ' + err.message);
        }
        setSyncing(false);
    }

    function handleDisconnect() {
        localStorage.removeItem('diario_sync_key');
        setIsConnected(false);
        setSyncKey('');
        setMessage('ℹ️ Desconectado de la nube. Tus datos ahora solo se guardan en este dispositivo.');
    }

    return (
        <div className="settings-page animate-fade-in">
            <h1 className="page-title">Ajustes</h1>

            {/* Profile section */}
            <section className="settings-section glass-card">
                <h2 className="section-title">Perfil</h2>
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
                <h2 className="section-title">Configuración de IA</h2>
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
                                <span className="provider-dot" style={{ background: '#10B981' }}></span> OpenAI
                            </button>
                            <button className={`provider-btn ${provider === 'gemini' ? 'provider-btn--active' : ''}`}
                                onClick={() => setProvider('gemini')}>
                                <span className="provider-dot" style={{ background: '#3B82F6' }}></span> Google Gemini
                            </button>
                            <button className={`provider-btn ${provider === 'claude' ? 'provider-btn--active' : ''}`}
                                onClick={() => setProvider('claude')}>
                                <span className="provider-dot" style={{ background: '#8B5CF6' }}></span> Claude
                            </button>
                            <button className={`provider-btn ${provider === 'ollama' ? 'provider-btn--active' : ''}`}
                                onClick={() => setProvider('ollama')}>
                                <span className="provider-dot" style={{ background: '#F59E0B' }}></span> Ollama (Local)
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

                    <button className="btn btn-warm liquid-btn" onClick={handleSaveAPI} disabled={(provider !== 'ollama' && !apiKey) || saving}>
                        {saving ? 'Guardando...' : 'Guardar configuración'}
                    </button>

                    {message && <div className="settings-message animate-fade-in">{message}</div>}
                </div>
            </section>

            {/* Sync Section */}
            <section className="settings-section glass-card">
                <h2 className="section-title">
                    Sincronización en la Nube {isConnected && <span className="key-status" style={{ color: '#10B981' }}>● En línea</span>}
                </h2>
                <p className="section-desc">
                    Mantén tus datos respaldados y sincronizados entre dispositivos. Tus datos se encriptan de forma segura en tu dispositivo (AES-256-GCM) y se guardan en internet anónimamente, por lo que nadie más puede leerlos.
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>

                    {isConnected ? (
                        <div className="input-group">
                            <label className="input-label">Tu Llave Maestra Actual</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <input type="text" className="input-field" style={{ flex: 1, minWidth: '200px', cursor: 'pointer', background: 'var(--bg-card)', color: 'var(--text-muted)' }}
                                    readOnly value={syncKey} onClick={e => e.target.select()} title="Haz clic para seleccionar y copiar" />
                                <button className="btn btn-secondary" onClick={handleDisconnect} disabled={syncing}>
                                    Desconectar
                                </button>
                            </div>
                            <span className="input-hint">
                                Esta aplicación está guardando automáticamente en internet todos los cambios que haces en tu diario usando esta llave. Cópiala y úsala en otros dispositivos para mantenerlos en sincronía.
                            </span>
                        </div>
                    ) : (
                        <div className="input-group">
                            <label className="input-label">Conectar a la Nube (Ingresa tu Llave O genera una nueva)</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <input type="text" className="input-field" style={{ flex: 1, minWidth: '200px' }}
                                    placeholder="Ej: 123456... @ a1b2c3..."
                                    value={syncKey} onChange={e => setSyncKey(e.target.value)} />
                                <button className="btn btn-primary liquid-btn" onClick={handleConnect} disabled={syncing || !syncKey}>
                                    {syncing ? 'Conectando...' : 'Conectar Llave'}
                                </button>
                                <button className="btn btn-warm liquid-btn" onClick={handleSetupNewSync} disabled={syncing}>
                                    {syncing ? 'Generando...' : 'Crear Llave Nueva'}
                                </button>
                            </div>
                            <span className="input-hint">
                                Si ya tienes una llave de otro dispositivo, pégala aquí y haz clic en "Conectar Llave". Si no tienes una, haz clic en "Crear Llave Nueva" para respaldar tus datos actuales.
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* Data Import/Export */}
            <section className="settings-section glass-card">
                <h2 className="section-title">Tus Datos Locales</h2>
                <p className="section-desc">
                    Esta versión de la aplicación guarda todos tus registros y configuraciones localmente en tu navegador para proteger tu privacidad.
                    Si cambias de dispositivo o navegador, tus datos NO se sincronizarán automáticamente.
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    <div className="input-group">
                        <label className="input-label">Restaurar Datos (Importar JSON)</label>
                        <input
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            id="import-file"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                try {
                                    const text = await file.text();
                                    const json = JSON.parse(text);
                                    if (!Array.isArray(json)) throw new Error("El archivo no tiene el formato correcto.");
                                    const count = await import('../services/api').then(m => m.entriesAPI.importMany(json));
                                    setMessage(`📦 ¡Éxito! Se han importado ${count} registros.`);
                                } catch (err) {
                                    setMessage('❌ Error al importar: ' + err.message);
                                }
                                e.target.value = ''; // reset
                            }}
                        />
                        <button className="btn btn-secondary" onClick={() => document.getElementById('import-file').click()}>
                            Seleccionar Archivo JSON
                        </button>
                        <span className="input-hint">Sube un archivo JSON generado con la opción "Exportar JSON" de la página Análisis.</span>
                    </div>
                </div>
            </section>

            {/* About */}
            <section className="settings-section glass-card">
                <h2 className="section-title">Acerca de</h2>
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
                <button className="btn btn-danger" onClick={logout}>Cambiar usuario</button>
            </div>
        </div>
    );
}
