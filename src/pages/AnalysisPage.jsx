import { useState, useEffect } from 'react';
import { aiAPI, entriesAPI } from '../services/api';
import './AnalysisPage.css';

export default function AnalysisPage() {
    const [config, setConfig] = useState({ hasKey: false, provider: 'openai' });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [entriesCount, setEntriesCount] = useState(0);

    useEffect(() => {
        aiAPI.getConfig().then(setConfig).catch(() => { });
        entriesAPI.list({}).then(e => setEntriesCount(e.length)).catch(() => { });
        // Set default date range to last 30 days
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    }, []);

    async function handleAnalyze() {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const data = await aiAPI.analyze({ startDate, endDate });
            setResult(data);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    }

    async function handleExport(format) {
        try {
            const data = await entriesAPI.export({ format, startDate, endDate });
            if (format === 'csv') {
                const blob = new Blob([data], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'diario_emociones.csv';
                a.click();
                URL.revokeObjectURL(url);
            } else {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'diario_emociones.json';
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            setError('Error al exportar: ' + err.message);
        }
    }

    return (
        <div className="analysis-page animate-fade-in">
            <h1 className="page-title">Análisis con IA</h1>
            <p className="page-subtitle">
                Analiza tus patrones emocionales y recibe retroalimentación personalizada.
                Tienes <strong>{entriesCount}</strong> registros en total.
            </p>

            {!config.hasKey && (
                <div className="config-warning glass-card">
                    <span className="warning-icon">⚠</span>
                    <div>
                        <p><strong>API Key no configurada</strong></p>
                        <p>Ve a <strong>Ajustes</strong> para configurar tu clave de API ({config.provider === 'gemini' ? 'Google Gemini' : 'OpenAI'})</p>
                    </div>
                </div>
            )}

            {/* Date range & actions */}
            <div className="analysis-controls glass-card">
                <div className="date-range">
                    <div className="input-group">
                        <label className="input-label">Desde</label>
                        <input type="date" className="input-field" value={startDate}
                            onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Hasta</label>
                        <input type="date" className="input-field" value={endDate}
                            onChange={e => setEndDate(e.target.value)} />
                    </div>
                </div>

                <div className="analysis-actions">
                    <button className="btn btn-primary btn-lg" onClick={handleAnalyze}
                        disabled={loading || !config.hasKey}>
                        {loading ? 'Analizando...' : 'Analizar mis emociones'}
                    </button>
                    <div className="export-buttons">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleExport('json')}>JSON</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleExport('csv')}>CSV</button>
                    </div>
                </div>
            </div>

            {error && <div className="analysis-error glass-card animate-fade-in">{error}</div>}

            {loading && (
                <div className="analysis-loading">
                    <div className="loading-orb animate-breathe">···</div>
                    <p>Analizando tus registros emocionales...</p>
                    <p className="loading-sub">Esto puede tomar unos segundos</p>
                </div>
            )}

            {result && (
                <div className="analysis-results animate-fade-in-up">
                    <div className="results-header">
                        <h2>Resultados del Análisis</h2>
                        <span className="results-meta">
                            {result.entriesAnalyzed} registros • {result.dateRange?.start} a {result.dateRange?.end}
                        </span>
                    </div>

                    {/* Summary */}
                    <div className="result-card glass-card">
                        <h3>Resumen General</h3>
                        <p>{result.analysis?.summary}</p>
                    </div>

                    {/* Emotional trend */}
                    {result.analysis?.emotionalTrend && (
                        <div className="result-card glass-card">
                            <h3>Tendencia Emocional</h3>
                            <p>{result.analysis.emotionalTrend}</p>
                        </div>
                    )}

                    {/* Patterns */}
                    {result.analysis?.patterns?.length > 0 && (
                        <div className="result-card glass-card">
                            <h3>Patrones Identificados</h3>
                            <ul className="result-list">
                                {result.analysis.patterns.map((p, i) => (
                                    <li key={i}>{p}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Cognitive distortions */}
                    {result.analysis?.cognitiveDistortions?.length > 0 && (
                        <div className="result-card glass-card result-card--warning">
                            <h3>Distorsiones Cognitivas Detectadas</h3>
                            <ul className="result-list">
                                {result.analysis.cognitiveDistortions.map((d, i) => (
                                    <li key={i}>{d}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Strengths */}
                    {result.analysis?.strengths?.length > 0 && (
                        <div className="result-card glass-card result-card--success">
                            <h3>Fortalezas</h3>
                            <ul className="result-list">
                                {result.analysis.strengths.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations */}
                    {result.analysis?.recommendations?.length > 0 && (
                        <div className="result-card glass-card result-card--primary">
                            <h3>Recomendaciones</h3>
                            <ul className="result-list">
                                {result.analysis.recommendations.map((r, i) => (
                                    <li key={i}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
