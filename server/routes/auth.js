import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
    try {
        const { username, email, password, displayName } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const db = req.app.locals.db;

        // Check if user exists
        const existing = db.exec("SELECT id FROM users WHERE username = ? OR email = ?", [username, email]);
        if (existing.length > 0 && existing[0].values.length > 0) {
            return res.status(409).json({ error: 'El usuario o email ya existe' });
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        // Insert user
        db.run(
            "INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
            [username, email, passwordHash, displayName || username]
        );
        req.app.locals.saveDB();

        // Get the created user
        const result = db.exec("SELECT id, username, email, display_name FROM users WHERE username = ?", [username]);
        const user = {
            id: result[0].values[0][0],
            username: result[0].values[0][1],
            email: result[0].values[0][2],
            displayName: result[0].values[0][3]
        };

        // Generate token
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user, token });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }

        const db = req.app.locals.db;
        const result = db.exec(
            "SELECT id, username, email, display_name, password_hash FROM users WHERE username = ? OR email = ?",
            [username, username]
        );

        if (result.length === 0 || result[0].values.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const row = result[0].values[0];
        const user = { id: row[0], username: row[1], email: row[2], displayName: row[3] };
        const passwordHash = row[4];

        // Verify password
        const isValid = bcrypt.compareSync(password, passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Generate token
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user, token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
    try {
        const db = req.app.locals.db;
        const result = db.exec(
            "SELECT id, username, email, display_name, api_provider, created_at FROM users WHERE id = ?",
            [req.userId]
        );

        if (result.length === 0 || result[0].values.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const row = result[0].values[0];
        res.json({
            id: row[0],
            username: row[1],
            email: row[2],
            displayName: row[3],
            apiProvider: row[4],
            hasApiKey: !!row[5],
            createdAt: row[5]
        });
    } catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

export default router;
