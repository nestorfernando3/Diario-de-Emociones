import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

// PUT /api/ai/config - Save API key and provider
router.put('/config', (req, res) => {
    try {
        const { apiKey, apiProvider } = req.body;
        const db = req.app.locals.db;

        db.run(
            "UPDATE users SET api_key = ?, api_provider = ? WHERE id = ?",
            [apiKey, apiProvider || 'openai', req.userId]
        );
        req.app.locals.saveDB();

        res.json({ message: 'Configuración de IA actualizada' });
    } catch (err) {
        console.error('AI config error:', err);
        res.status(500).json({ error: 'Error al guardar configuración' });
    }
});

// GET /api/ai/config - Get AI configuration status
router.get('/config', (req, res) => {
    try {
        const db = req.app.locals.db;
        const result = db.exec(
            "SELECT api_key, api_provider FROM users WHERE id = ?",
            [req.userId]
        );

        if (result.length === 0 || result[0].values.length === 0) {
            return res.json({ hasKey: false, provider: 'openai' });
        }

        const row = result[0].values[0];
        res.json({
            hasKey: !!row[0],
            provider: row[1] || 'openai'
        });
    } catch (err) {
        console.error('AI config get error:', err);
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
});

// POST /api/ai/analyze - Analyze entries with AI
router.post('/analyze', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const db = req.app.locals.db;

        // Get user API config
        const userResult = db.exec(
            "SELECT api_key, api_provider FROM users WHERE id = ?",
            [req.userId]
        );

        if (userResult.length === 0 || !userResult[0].values[0][0]) {
            return res.status(400).json({
                error: 'Necesitas configurar tu API Key en Ajustes antes de usar el análisis con IA'
            });
        }

        const apiKey = userResult[0].values[0][0];
        const provider = userResult[0].values[0][1] || 'openai';

        // Get entries for analysis
        let query = "SELECT * FROM entries WHERE user_id = ?";
        let params = [req.userId];

        if (startDate && endDate) {
            query += " AND entry_date BETWEEN ? AND ?";
            params.push(startDate, endDate);
        }
        query += " ORDER BY entry_date ASC";

        const entriesResult = db.exec(query, params);

        if (entriesResult.length === 0 || entriesResult[0].values.length === 0) {
            return res.status(400).json({ error: 'No hay registros para analizar en el rango seleccionado' });
        }

        const columns = entriesResult[0].columns;
        const entries = entriesResult[0].values.map(row => {
            const entry = {};
            columns.forEach((col, i) => {
                entry[col] = row[i];
            });
            return entry;
        });

        // Build prompt
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

        let analysis;

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

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                return res.status(400).json({ error: `Error de OpenAI: ${errData.error?.message || response.statusText}` });
            }

            const data = await response.json();
            analysis = JSON.parse(data.choices[0].message.content);
        } else if (provider === 'gemini') {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: `${systemPrompt}\n\nRegistros:\n\n${entriesText}` }]
                        }],
                        generationConfig: {
                            responseMimeType: 'application/json',
                            temperature: 0.7
                        }
                    })
                }
            );

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                return res.status(400).json({ error: `Error de Gemini: ${errData.error?.message || response.statusText}` });
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            analysis = JSON.parse(text);
        } else if (provider === 'claude') {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-latest',
                    max_tokens: 2000,
                    system: systemPrompt,
                    messages: [
                        { role: 'user', content: `Aquí están mis registros:\n\n${entriesText}\n\nResponde únicamente con un objeto JSON válido.` }
                    ]
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                return res.status(400).json({ error: `Error de Claude: ${errData.error?.message || response.statusText}` });
            }

            const data = await response.json();
            let text = data.content[0].text;
            if (text.includes('```json')) {
                text = text.substring(text.indexOf('```json') + 7, text.lastIndexOf('```'));
            } else if (text.includes('```')) {
                text = text.substring(text.indexOf('```') + 3, text.lastIndexOf('```'));
            }
            analysis = JSON.parse(text.trim());
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

            if (!response.ok) {
                return res.status(400).json({ error: `Error de Ollama: Asegúrate de que Ollama está corriendo localmente en el puerto 11434 con el modelo ${modelName}.` });
            }

            const data = await response.json();
            analysis = JSON.parse(data.response);
        }

        res.json({
            analysis,
            entriesAnalyzed: entries.length,
            dateRange: { start: entries[0].entry_date, end: entries[entries.length - 1].entry_date }
        });

    } catch (err) {
        console.error('AI analyze error:', err);
        res.status(500).json({ error: 'Error al analizar con IA: ' + err.message });
    }
});

export default router;
