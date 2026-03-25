import express from 'express';
import pool from '../db.mjs';
import bcrypt from 'bcrypt';

const router = express.Router();

// 1. Registration: Hashes the password before saving to the database
router.post('/', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // Secure storage: Hash the password with 10 salt rounds
        const hashedPassword = await bcrypt.hash(password, 10);
        const queryText = `
            INSERT INTO users (username, password) 
            VALUES ($1, $2) 
            RETURNING id, username, created_at;
        `;
        
        const result = await pool.query(queryText, [username, hashedPassword]);
        res.status(201).json({ message: "User created successfully!", user: result.rows[0] });
    } catch (error) {
        // Handle duplicate username error from PostgreSQL
        if (error.code === '23505') {
            return res.status(409).json({ message: "Username already taken." });
        }
        res.status(500).json({ message: "Internal server error." });
    }
});

// 2. Secure Login: Verifies the hashed password using bcrypt.compare
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user) {
            // Compare the provided plaintext password with the hash in the DB
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                return res.json({ message: "Login successful", username: user.username });
            }
        }
        
        // Return 401 (Unauthorized) if user doesn't exist or password is wrong
        res.status(401).json({ message: "Invalid username or password" });
    } catch (error) {
        res.status(500).json({ message: "Server error during login" });
    }
});

// 3. Delete Account
router.delete('/:username', async (req, res) => {
    const username = req.params.username;
    try {
        await pool.query('DELETE FROM users WHERE username = $1', [username]);
        res.json({ message: `User ${username} deleted.` });
    } catch (error) {
        res.status(500).json({ message: "Delete failed." });
    }
});

export default router;