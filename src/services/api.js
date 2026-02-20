// Simulate a delay to feel like a real API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY_USERS = 'diario_users';
const STORAGE_KEY_ENTRIES = 'diario_entries';
const STORAGE_KEY_AI_CONFIG = 'diario_ai_config';
const STORAGE_KEY_CURRENT_USER = 'diario_current_user_id';

// Helper to get/set local storage data safely
const getStorage = (key, defaultVal = []) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch { return defaultVal; }
};
const setStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function getCurrentUserId() {
    return localStorage.getItem(STORAGE_KEY_CURRENT_USER);
}

// Auth
export const authAPI = {
    register: async (data) => {
        await delay(300);
        const users = getStorage(STORAGE_KEY_USERS);
        if (users.find(u => u.username === data.username || u.email === data.email)) {
            throw new Error('El usuario o email ya existe');
        }
        const newUser = {
            id: Date.now().toString(),
            username: data.username,
            email: data.email,
            displayName: data.displayName,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        setStorage(STORAGE_KEY_USERS, users);
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, newUser.id);

        // Mock token to satisfy AuthContext
        return { token: 'local-token-' + newUser.id, user: newUser };
    },
    login: async (data) => {
        await delay(300);
        const users = getStorage(STORAGE_KEY_USERS);
        const user = users.find(u => (u.username === data.username || u.email === data.email));
        // We skip password hashing in pure local storage for simplicity, treat any password as valid if user exists
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, user.id);
        return { token: 'local-token-' + user.id, user };
    },
    me: async () => {
        await delay(100);
        const userId = getCurrentUserId();
        if (!userId) throw new Error('No autorizado');
        const user = getStorage(STORAGE_KEY_USERS).find(u => u.id === userId);
        if (!user) throw new Error('Usuario no encontrado');
        return user;
    }
};

// Entries
export const entriesAPI = {
    list: async (params = {}) => {
        await delay(200);
        const userId = getCurrentUserId();
        if (!userId) throw new Error('No autorizado');

        let entries = getStorage(STORAGE_KEY_ENTRIES).filter(e => e.userId === userId);

        if (params.startDate && params.endDate) {
            entries = entries.filter(e => e.entry_date >= params.startDate && e.entry_date <= params.endDate);
        }

        // Sort by date descending
        return entries.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
    },
    get: async (id) => {
        await delay(100);
        const userId = getCurrentUserId();
        const entry = getStorage(STORAGE_KEY_ENTRIES).find(e => e.id === id && e.userId === userId);
        if (!entry) throw new Error('Registro no encontrado');
        return entry;
    },
    create: async (data) => {
        await delay(300);
        const userId = getCurrentUserId();
        if (!userId) throw new Error('No autorizado');

        const entries = getStorage(STORAGE_KEY_ENTRIES);
        const newEntry = {
            id: Date.now().toString(),
            userId,
            ...data,
            tags: JSON.stringify(data.tags || []),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        entries.push(newEntry);
        setStorage(STORAGE_KEY_ENTRIES, entries);
        return newEntry;
    },
    update: async (id, data) => {
        await delay(200);
        const userId = getCurrentUserId();
        const entries = getStorage(STORAGE_KEY_ENTRIES);
        const idx = entries.findIndex(e => e.id === id && e.userId === userId);
        if (idx === -1) throw new Error('Registro no encontrado');

        entries[idx] = { ...entries[idx], ...data, updated_at: new Date().toISOString() };
        if (data.tags && Array.isArray(data.tags)) {
            entries[idx].tags = JSON.stringify(data.tags);
        }
        setStorage(STORAGE_KEY_ENTRIES, entries);
        return entries[idx];
    },
    delete: async (id) => {
        await delay(200);
        const userId = getCurrentUserId();
        let entries = getStorage(STORAGE_KEY_ENTRIES);
        const initialLen = entries.length;
        entries = entries.filter(e => !(e.id === id && e.userId === userId));
        if (entries.length === initialLen) throw new Error('Registro no encontrado');
        setStorage(STORAGE_KEY_ENTRIES, entries);
        return { message: 'Eliminado correctamente' };
    },
    export: async (params = {}) => {
        const entries = await entriesAPI.list(params);
        return entries;
    },
    importMany: async (newEntries) => {
        const userId = getCurrentUserId();
        if (!userId) throw new Error('No autorizado');
        const entries = getStorage(STORAGE_KEY_ENTRIES);

        const imported = newEntries.map(e => ({
            ...e,
            id: e.id || Date.now().toString() + Math.random().toString().slice(2, 5),
            userId: userId
        }));

        setStorage(STORAGE_KEY_ENTRIES, [...entries, ...imported]);
        return imported.length;
    }
};

// AI
export const aiAPI = {
    getConfig: async () => {
        await delay(100);
        const userId = getCurrentUserId();
        const configs = getStorage(STORAGE_KEY_AI_CONFIG, {});
        const userConfig = configs[userId] || { provider: 'openai', apiKey: '' };
        return { hasKey: !!userConfig.apiKey, provider: userConfig.provider };
    },
    setConfig: async (data) => {
        await delay(200);
        const userId = getCurrentUserId();
        if (!userId) throw new Error('No autorizado');

        const configs = getStorage(STORAGE_KEY_AI_CONFIG, {});
        configs[userId] = {
            apiKey: data.apiKey,
            provider: data.apiProvider || 'openai'
        };
        setStorage(STORAGE_KEY_AI_CONFIG, configs);
        return { message: 'Configuración guardada' };
    },
    analyze: async (data) => {
        const userId = getCurrentUserId();
        const configs = getStorage(STORAGE_KEY_AI_CONFIG, {});
        const userConfig = configs[userId];

        if (!userConfig || !userConfig.apiKey) {
            throw new Error('Necesitas configurar tu API Key en Ajustes antes de usar el análisis con IA');
        }

        const entries = await entriesAPI.list({ startDate: data.startDate, endDate: data.endDate });
        if (entries.length === 0) {
            throw new Error('No hay registros para analizar en el rango seleccionado');
        }

        const entriesText = entries.map(e =>
            `Fecha: ${e.entry_date}\nSituación: ${e.situation}\nSentimiento: ${e.feeling} (${e.feeling_intensity}%)\nPensamiento automático: ${e.automatic_thought}\nEvidencia a favor: ${e.evidence_for}\nEvidencia en contra: ${e.evidence_against}\nPensamiento alternativo: ${e.alternative_thought}\nRecalificación: ${e.re_rating}%`
        ).join('\n---\n');

        const systemPrompt = `Eres un psicólogo experto en Terapia Cognitivo-Conductual (TCC). Analiza los siguientes registros de pensamiento de 7 columnas del diario emocional de un paciente. 

Proporciona tu análisis en formato JSON con esta estructura:
{
  "patterns": ["patrón 1", "patrón 2", ...],
  "cognitiveDistortions": ["distorsión 1", "distorsión 2", ...],
  "emotionalTrend": "descripción de la tendencia emocional",
  "recommendations": ["recomendación 1", "recomendación 2", ...],
  "strengths": ["fortaleza 1", "fortaleza 2", ...],
  "summary": "resumen general del análisis"
}

Sé empático, constructivo y específico. Responde siempre en español.`;

        const { provider, apiKey } = userConfig;
        let analysis;

        try {
            if (provider === 'openai') {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: `Aquí están mis registros:\n\n${entriesText}` }
                        ],
                        temperature: 0.7,
                        response_format: { type: 'json_object' }
                    })
                });

                if (!response.ok) throw new Error(`OpenAI Error: ${response.status}`);
                const resData = await response.json();
                analysis = JSON.parse(resData.choices[0].message.content);

            } else if (provider === 'gemini') {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: `${systemPrompt}\n\nRegistros:\n\n${entriesText}` }] }],
                            generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
                        })
                    }
                );

                if (!response.ok) throw new Error(`Gemini Error: ${response.status}`);
                const resData = await response.json();
                analysis = JSON.parse(resData.candidates[0].content.parts[0].text);

            } else if (provider === 'claude') {
                throw new Error("La API de Claude bloquea peticiones directamente desde el navegador (CORS). Por favor, intenta usar OpenAI, Gemini o Ollama local para esta versión WebApp local.");
            } else if (provider === 'ollama') {
                const modelName = apiKey || 'llama3.2';
                const response = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: modelName,
                        prompt: `${systemPrompt}\n\nAquí están mis registros:\n\n${entriesText}\n\nResponde EXCLUSIVAMENTE con el JSON.`,
                        format: 'json',
                        stream: false
                    })
                });

                if (!response.ok) throw new Error(`Ollama Error: Asegúrate de que Ollama está corriendo en http://localhost:11434`);
                const resData = await response.json();
                analysis = JSON.parse(resData.response);
            }

            return {
                analysis,
                entriesAnalyzed: entries.length,
                dateRange: { start: entries[entries.length - 1].entry_date, end: entries[0].entry_date }
            };

        } catch (err) {
            throw new Error(`Error al conectar con ${provider}: ${err.message}`);
        }
    }
};
