import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import initSqlJs from 'sql.js';
import authRoutes from './routes/auth.js';
import entriesRoutes from './routes/entries.js';
import aiRoutes from './routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = join(__dirname, 'db', 'database.sqlite');

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Initialize database
async function initDB() {
    const SQL = await initSqlJs();

    let db;
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // Run schema
    const schema = fs.readFileSync(join(__dirname, 'db', 'schema.sql'), 'utf-8');
    db.run(schema);
    saveDB(db);

    return db;
}

// Save database to file
function saveDB(db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.mkdirSync(join(__dirname, 'db'), { recursive: true });
    fs.writeFileSync(DB_PATH, buffer);
}

// Start server
initDB().then((db) => {
    // Make db and saveDB available to routes
    app.locals.db = db;
    app.locals.saveDB = () => saveDB(db);

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/entries', entriesRoutes);
    app.use('/api/ai', aiRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Serve Frontend in Production
    if (process.env.NODE_ENV === 'production') {
        const distPath = join(__dirname, '../client/dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, () => {
        console.log(`🌈 Diario de Emociones server running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
