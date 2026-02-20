import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/entries - List entries with optional date filters
router.get('/', (req, res) => {
    try {
        const db = req.app.locals.db;
        const { month, year, startDate, endDate } = req.query;

        let query = "SELECT * FROM entries WHERE user_id = ?";
        let params = [req.userId];

        if (startDate && endDate) {
            query += " AND entry_date BETWEEN ? AND ?";
            params.push(startDate, endDate);
        } else if (month && year) {
            const start = `${year}-${String(month).padStart(2, '0')}-01`;
            const end = `${year}-${String(month).padStart(2, '0')}-31`;
            query += " AND entry_date BETWEEN ? AND ?";
            params.push(start, end);
        }

        query += " ORDER BY entry_date DESC, created_at DESC";

        const result = db.exec(query, params);

        if (result.length === 0) {
            return res.json([]);
        }

        const columns = result[0].columns;
        const entries = result[0].values.map(row => {
            const entry = {};
            columns.forEach((col, i) => {
                entry[col] = row[i];
            });
            entry.tags = JSON.parse(entry.tags || '[]');
            return entry;
        });

        res.json(entries);
    } catch (err) {
        console.error('List entries error:', err);
        res.status(500).json({ error: 'Error al obtener registros' });
    }
});

// GET /api/entries/export - Export all entries as JSON or CSV
router.get('/export', (req, res) => {
    try {
        const db = req.app.locals.db;
        const { format = 'json', startDate, endDate } = req.query;

        let query = "SELECT * FROM entries WHERE user_id = ?";
        let params = [req.userId];

        if (startDate && endDate) {
            query += " AND entry_date BETWEEN ? AND ?";
            params.push(startDate, endDate);
        }

        query += " ORDER BY entry_date ASC";

        const result = db.exec(query, params);

        if (result.length === 0) {
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=diario_emociones.csv');
                return res.send('Fecha,Situación,Sentimiento,Intensidad,Pensamiento Automático,Evidencia a Favor,Evidencia en Contra,Pensamiento Alternativo,Recalificación\n');
            }
            return res.json([]);
        }

        const columns = result[0].columns;
        const entries = result[0].values.map(row => {
            const entry = {};
            columns.forEach((col, i) => {
                entry[col] = row[i];
            });
            entry.tags = JSON.parse(entry.tags || '[]');
            return entry;
        });

        if (format === 'csv') {
            const csvHeader = 'Fecha,Situación,Sentimiento,Intensidad(%),Pensamiento Automático,Evidencia a Favor,Evidencia en Contra,Pensamiento Alternativo,Recalificación(%)\n';
            const csvRows = entries.map(e =>
                `"${e.entry_date}","${(e.situation || '').replace(/"/g, '""')}","${e.feeling}",${e.feeling_intensity},"${(e.automatic_thought || '').replace(/"/g, '""')}","${(e.evidence_for || '').replace(/"/g, '""')}","${(e.evidence_against || '').replace(/"/g, '""')}","${(e.alternative_thought || '').replace(/"/g, '""')}",${e.re_rating || ''}`
            ).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=diario_emociones.csv');
            return res.send(csvHeader + csvRows);
        }

        res.json(entries);
    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ error: 'Error al exportar registros' });
    }
});

// GET /api/entries/:id - Single entry
router.get('/:id', (req, res) => {
    try {
        const db = req.app.locals.db;
        const result = db.exec(
            "SELECT * FROM entries WHERE id = ? AND user_id = ?",
            [req.params.id, req.userId]
        );

        if (result.length === 0 || result[0].values.length === 0) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        const columns = result[0].columns;
        const row = result[0].values[0];
        const entry = {};
        columns.forEach((col, i) => {
            entry[col] = row[i];
        });
        entry.tags = JSON.parse(entry.tags || '[]');

        res.json(entry);
    } catch (err) {
        console.error('Get entry error:', err);
        res.status(500).json({ error: 'Error al obtener registro' });
    }
});

// POST /api/entries - Create new entry
router.post('/', (req, res) => {
    try {
        const db = req.app.locals.db;
        const {
            entryDate, situation, feeling, feelingIntensity,
            automaticThought, evidenceFor, evidenceAgainst,
            alternativeThought, reRating, moodColor, tags
        } = req.body;

        if (!entryDate || !situation || !feeling) {
            return res.status(400).json({ error: 'Fecha, situación y sentimiento son requeridos' });
        }

        db.run(
            `INSERT INTO entries (user_id, entry_date, situation, feeling, feeling_intensity, 
       automatic_thought, evidence_for, evidence_against, alternative_thought, 
       re_rating, mood_color, tags) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.userId, entryDate, situation, feeling, feelingIntensity || 50,
                automaticThought || '', evidenceFor || '', evidenceAgainst || '',
                alternativeThought || '', reRating || null, moodColor || '#6366f1',
                JSON.stringify(tags || [])
            ]
        );
        req.app.locals.saveDB();

        // Get the created entry
        const result = db.exec("SELECT last_insert_rowid() as id");
        const newId = result[0].values[0][0];

        const entryResult = db.exec("SELECT * FROM entries WHERE id = ?", [newId]);
        const columns = entryResult[0].columns;
        const row = entryResult[0].values[0];
        const entry = {};
        columns.forEach((col, i) => {
            entry[col] = row[i];
        });
        entry.tags = JSON.parse(entry.tags || '[]');

        res.status(201).json(entry);
    } catch (err) {
        console.error('Create entry error:', err);
        res.status(500).json({ error: 'Error al crear registro' });
    }
});

// PUT /api/entries/:id - Update entry
router.put('/:id', (req, res) => {
    try {
        const db = req.app.locals.db;
        const {
            situation, feeling, feelingIntensity,
            automaticThought, evidenceFor, evidenceAgainst,
            alternativeThought, reRating, moodColor, tags
        } = req.body;

        // Verify ownership
        const existing = db.exec("SELECT id FROM entries WHERE id = ? AND user_id = ?", [req.params.id, req.userId]);
        if (existing.length === 0 || existing[0].values.length === 0) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        db.run(
            `UPDATE entries SET 
       situation = ?, feeling = ?, feeling_intensity = ?,
       automatic_thought = ?, evidence_for = ?, evidence_against = ?,
       alternative_thought = ?, re_rating = ?, mood_color = ?, tags = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
            [
                situation, feeling, feelingIntensity,
                automaticThought, evidenceFor, evidenceAgainst,
                alternativeThought, reRating, moodColor,
                JSON.stringify(tags || []),
                req.params.id, req.userId
            ]
        );
        req.app.locals.saveDB();

        res.json({ message: 'Registro actualizado', id: req.params.id });
    } catch (err) {
        console.error('Update entry error:', err);
        res.status(500).json({ error: 'Error al actualizar registro' });
    }
});

// DELETE /api/entries/:id
router.delete('/:id', (req, res) => {
    try {
        const db = req.app.locals.db;

        const existing = db.exec("SELECT id FROM entries WHERE id = ? AND user_id = ?", [req.params.id, req.userId]);
        if (existing.length === 0 || existing[0].values.length === 0) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        db.run("DELETE FROM entries WHERE id = ? AND user_id = ?", [req.params.id, req.userId]);
        req.app.locals.saveDB();

        res.json({ message: 'Registro eliminado' });
    } catch (err) {
        console.error('Delete entry error:', err);
        res.status(500).json({ error: 'Error al eliminar registro' });
    }
});

export default router;
