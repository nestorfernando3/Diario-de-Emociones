import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { entriesAPI } from '../services/api';
import MoodSpheres, { EMOTIONS } from '../components/three/MoodSpheres';
import './NewEntryPage.css';

const STEPS = [
    { key: 'situation', icon: '📍', title: 'Situación', desc: '¿Quién, qué, cuándo, dónde? Solo hechos objetivos.', tip: 'Describe la situación de manera objetiva, como si fueras un periodista reportando los hechos.' },
    { key: 'feeling', icon: '💭', title: 'Sentimiento', desc: 'Selecciona la emoción que sentiste y su intensidad.', tip: 'Identifica la emoción principal. No hay emociones "buenas" o "malas", todas son información valiosa.' },
    { key: 'automatic_thought', icon: '⚡', title: 'Pensamiento Automático', desc: '¿Cuál fue tu pensamiento más fuerte en ese momento?', tip: 'Enfócate en el "pensamiento caliente" — el que disparó la reacción emocional más intensa.' },
    { key: 'evidence_for', icon: '✅', title: 'Evidencia a Favor', desc: '¿Qué hechos reales apoyan ese pensamiento?', tip: 'Recuerda: la evidencia debe ser hechos concretos, no otros sentimientos ni suposiciones.' },
    { key: 'evidence_against', icon: '❌', title: 'Evidencia en Contra', desc: '¿Qué hechos contradicen o cuestionan ese pensamiento?', tip: '¿Hay otra explicación posible? ¿Qué le dirías a un amigo en esta situación?' },
    { key: 'alternative_thought', icon: '🔄', title: 'Pensamiento Alternativo', desc: 'Desarrolla una perspectiva más equilibrada y realista.', tip: 'No se trata de "pensar en positivo", sino de pensar de forma más realista y equilibrada.' },
    { key: 're_rating', icon: '📊', title: 'Recalificar', desc: '¿Cómo calificas ahora la intensidad de tu emoción?', tip: 'Compara con tu calificación inicial. El objetivo es reducir el poder emocional del pensamiento.' },
];

export default function NewEntryPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get('date');

    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [showTip, setShowTip] = useState(false);
    const [form, setForm] = useState({
        entryDate: dateParam || new Date().toISOString().split('T')[0],
        situation: '',
        feeling: '',
        feelingIntensity: 50,
        automaticThought: '',
        evidenceFor: '',
        evidenceAgainst: '',
        alternativeThought: '',
        reRating: 50,
        moodColor: '#6366f1',
        tags: [],
    });
    const [selectedEmotion, setSelectedEmotion] = useState(null);

    function handleEmotionSelect(emotion) {
        setSelectedEmotion(emotion);
        setForm(prev => ({
            ...prev,
            feeling: emotion.name,
            moodColor: emotion.color,
        }));
    }

    function canProceed() {
        switch (step) {
            case 0: return form.situation.trim().length > 0;
            case 1: return form.feeling.length > 0;
            case 2: return form.automaticThought.trim().length > 0;
            case 3: return form.evidenceFor.trim().length > 0;
            case 4: return form.evidenceAgainst.trim().length > 0;
            case 5: return form.alternativeThought.trim().length > 0;
            case 6: return true;
            default: return false;
        }
    }

    async function handleSubmit() {
        setSaving(true);
        try {
            await entriesAPI.create(form);
            navigate('/dashboard');
        } catch (err) {
            alert('Error: ' + err.message);
        }
        setSaving(false);
    }

    const currentStep = STEPS[step];
    const progress = ((step + 1) / STEPS.length) * 100;

    return (
        <div className="new-entry-page animate-fade-in">
            {/* Progress bar */}
            <div className="wizard-progress">
                <div className="wizard-progress-bar" style={{ width: `${progress}%`, background: selectedEmotion?.color || 'var(--primary-500)' }} />
            </div>

            <div className="wizard-header">
                <div className="wizard-step-indicator">
                    {STEPS.map((s, i) => (
                        <div key={i} className={`step-dot ${i === step ? 'step-dot--active' : i < step ? 'step-dot--done' : ''}`}
                            style={i === step ? { background: selectedEmotion?.color } : i < step ? { background: selectedEmotion?.color, opacity: 0.5 } : {}}
                            onClick={() => i < step && setStep(i)} />
                    ))}
                </div>
                <span className="wizard-step-count">Paso {step + 1} de {STEPS.length}</span>
            </div>

            <div className="wizard-content glass-card animate-fade-in-up" key={step}>
                <div className="wizard-step-header">
                    <span className="wizard-step-icon">{currentStep.icon}</span>
                    <h2 className="wizard-step-title">{currentStep.title}</h2>
                    <p className="wizard-step-desc">{currentStep.desc}</p>
                    <button className="tip-toggle btn btn-ghost btn-sm" onClick={() => setShowTip(!showTip)}>
                        {showTip ? '🙈 Ocultar tip' : '💡 Ver tip'}
                    </button>
                    {showTip && <div className="wizard-tip animate-fade-in-down">{currentStep.tip}</div>}
                </div>

                <div className="wizard-step-body">
                    {/* Step 0: Situation */}
                    {step === 0 && (
                        <>
                            <div className="input-group">
                                <label className="input-label">Fecha del evento</label>
                                <input type="date" className="input-field" value={form.entryDate}
                                    onChange={e => setForm(p => ({ ...p, entryDate: e.target.value }))} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Describe la situación</label>
                                <textarea className="input-field" placeholder="¿Qué pasó? ¿Dónde estabas? ¿Con quién?"
                                    value={form.situation} onChange={e => setForm(p => ({ ...p, situation: e.target.value }))}
                                    rows={5} />
                            </div>
                        </>
                    )}

                    {/* Step 1: Feeling */}
                    {step === 1 && (
                        <>
                            <MoodSpheres onSelect={handleEmotionSelect} selected={selectedEmotion} />
                            {selectedEmotion && (
                                <div className="feeling-selected animate-fade-in-up">
                                    <p className="feeling-name" style={{ color: selectedEmotion.color }}>
                                        {selectedEmotion.emoji} {selectedEmotion.name}
                                    </p>
                                    <div className="input-group">
                                        <label className="input-label">Intensidad: {form.feelingIntensity}%</label>
                                        <div className="slider-container">
                                            <span>0%</span>
                                            <input type="range" min="0" max="100" value={form.feelingIntensity}
                                                onChange={e => setForm(p => ({ ...p, feelingIntensity: parseInt(e.target.value) }))}
                                                style={{ accentColor: selectedEmotion.color }} />
                                            <span>100%</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Fallback text input */}
                            <div className="input-group" style={{ marginTop: '1rem' }}>
                                <label className="input-label">O escribe la emoción</label>
                                <input className="input-field" placeholder="Ej: Frustración, Ansiedad..."
                                    value={form.feeling} onChange={e => setForm(p => ({ ...p, feeling: e.target.value }))} />
                            </div>
                        </>
                    )}

                    {/* Step 2: Automatic Thought */}
                    {step === 2 && (
                        <div className="input-group">
                            <textarea className="input-field" placeholder="¿Cuál fue el pensamiento más fuerte que tuviste?"
                                value={form.automaticThought} onChange={e => setForm(p => ({ ...p, automaticThought: e.target.value }))}
                                rows={5} />
                        </div>
                    )}

                    {/* Step 3: Evidence For */}
                    {step === 3 && (
                        <div className="input-group">
                            <textarea className="input-field" placeholder="¿Qué hechos concretos respaldan ese pensamiento?"
                                value={form.evidenceFor} onChange={e => setForm(p => ({ ...p, evidenceFor: e.target.value }))}
                                rows={5} />
                        </div>
                    )}

                    {/* Step 4: Evidence Against */}
                    {step === 4 && (
                        <div className="input-group">
                            <textarea className="input-field" placeholder="¿Qué hechos contradicen ese pensamiento?"
                                value={form.evidenceAgainst} onChange={e => setForm(p => ({ ...p, evidenceAgainst: e.target.value }))}
                                rows={5} />
                        </div>
                    )}

                    {/* Step 5: Alternative Thought */}
                    {step === 5 && (
                        <div className="input-group">
                            <textarea className="input-field" placeholder="¿Cómo podrías ver la situación de forma más equilibrada?"
                                value={form.alternativeThought} onChange={e => setForm(p => ({ ...p, alternativeThought: e.target.value }))}
                                rows={5} />
                        </div>
                    )}

                    {/* Step 6: Re-rating */}
                    {step === 6 && (
                        <div className="re-rating-section">
                            <div className="re-rating-comparison">
                                <div className="rating-box">
                                    <span className="rating-label">Antes</span>
                                    <span className="rating-value" style={{ color: selectedEmotion?.color || 'var(--emotion-anger)' }}>
                                        {form.feelingIntensity}%
                                    </span>
                                </div>
                                <span className="rating-arrow">→</span>
                                <div className="rating-box">
                                    <span className="rating-label">Después</span>
                                    <span className="rating-value" style={{ color: 'var(--emotion-calm)' }}>
                                        {form.reRating}%
                                    </span>
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Nueva intensidad: {form.reRating}%</label>
                                <div className="slider-container">
                                    <span>0%</span>
                                    <input type="range" min="0" max="100" value={form.reRating}
                                        onChange={e => setForm(p => ({ ...p, reRating: parseInt(e.target.value) }))}
                                        style={{ accentColor: 'var(--emotion-calm)' }} />
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="wizard-nav">
                <button className="btn btn-secondary" onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}>
                    {step === 0 ? '← Cancelar' : '← Anterior'}
                </button>
                {step < STEPS.length - 1 ? (
                    <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                        Siguiente →
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? '⏳ Guardando...' : '✨ Guardar Registro'}
                    </button>
                )}
            </div>
        </div>
    );
}
