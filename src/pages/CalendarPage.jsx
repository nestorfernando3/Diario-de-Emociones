import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { entriesAPI } from '../services/api';
import './CalendarPage.css';

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const EMOTION_COLORS = {
    'Alegría': '#fbbf24', 'Tristeza': '#3b82f6', 'Enojo': '#ef4444',
    'Miedo': '#7c3aed', 'Sorpresa': '#f97316', 'Asco': '#84cc16',
    'Calma': '#34d399', 'Amor': '#ec4899',
};

export default function CalendarPage() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [entries, setEntries] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [dayEntries, setDayEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        loadEntries();
    }, [month, year]);

    async function loadEntries() {
        setLoading(true);
        try {
            const data = await entriesAPI.list({ month: month + 1, year });
            setEntries(data);
        } catch (err) {
            console.error('Error loading calendar:', err);
        }
        setLoading(false);
    }

    function getDaysInMonth() {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        const days = [];
        // Previous month padding
        for (let i = startDay - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            days.push({ date: d, isCurrentMonth: false });
        }
        // Current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        // Next month padding
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        return days;
    }

    function getEntriesForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return entries.filter(e => e.entryDate === dateStr);
    }

    function handleDayClick(day) {
        if (!day.isCurrentMonth) return;
        const dateStr = day.date.toISOString().split('T')[0];
        setSelectedDay(dateStr);
        setDayEntries(getEntriesForDate(day.date));
    }

    function prevMonth() {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDay(null);
    }

    function nextMonth() {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDay(null);
    }

    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }

    const days = getDaysInMonth();

    return (
        <div className="calendar-page animate-fade-in">
            <header className="calendar-header">
                <h1 className="page-title">Calendario</h1>
                <button className="btn btn-warm" onClick={() => navigate('/new-entry')}>Nuevo Registro</button>
            </header>

            <div className="calendar-container glass-card">
                <div className="calendar-nav">
                    <button className="btn btn-ghost" onClick={prevMonth}>← Anterior</button>
                    <h2 className="calendar-month">{MONTHS_ES[month]} {year}</h2>
                    <button className="btn btn-ghost" onClick={nextMonth}>Siguiente →</button>
                </div>

                <div className="calendar-grid">
                    {DAYS_ES.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
                    {days.map((day, i) => {
                        const dayEntries = getEntriesForDate(day.date);
                        const dateStr = day.date.toISOString().split('T')[0];
                        return (
                            <div key={i}
                                className={`calendar-day ${!day.isCurrentMonth ? 'calendar-day--other' : ''} ${isToday(day.date) ? 'calendar-day--today' : ''} ${selectedDay === dateStr ? 'calendar-day--selected' : ''} ${dayEntries.length > 0 ? 'calendar-day--has-entry' : ''}`}
                                onClick={() => handleDayClick(day)}>
                                <span className="day-number">{day.date.getDate()}</span>
                                {dayEntries.length > 0 && (
                                    <div className="day-dots">
                                        {dayEntries.slice(0, 3).map((e, j) => (
                                            <span key={j} className="day-dot" style={{ background: EMOTION_COLORS[e.feeling] || e.moodColor }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected day detail */}
            {selectedDay && (
                <div className="day-detail glass-card animate-fade-in-up">
                    <div className="day-detail-header">
                        <h3>{new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/new-entry?date=${selectedDay}`)}>+ Agregar</button>
                    </div>
                    {dayEntries.length === 0 ? (
                        <p className="day-detail-empty">No hay registros para este día</p>
                    ) : (
                        <div className="day-entries">
                            {dayEntries.map(entry => (
                                <div key={entry.id} className="day-entry-card">
                                    <div className="day-entry-color" style={{ background: EMOTION_COLORS[entry.feeling] || entry.moodColor }} />
                                    <div className="day-entry-info">
                                        <strong style={{ color: EMOTION_COLORS[entry.feeling] }}>{entry.feeling}</strong>
                                        <span className="day-entry-intensity">{entry.feelingIntensity}%{entry.reRating != null ? ` → ${entry.reRating}%` : ''}</span>
                                        <p className="day-entry-situation">{entry.situation}</p>
                                        {entry.alternative_thought && (
                                            <p className="day-entry-alt">{entry.alternative_thought}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
