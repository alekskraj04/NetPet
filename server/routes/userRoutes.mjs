import express from 'express';
import pool from '../db.mjs';
import bcrypt from 'bcrypt';

const router = express.Router();

/**
 * Route: POST /api/users
 * Handles user registration with password hashing
 */
router.post('/', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // Hash password with salt rounds (cost factor) of 10
        const hashedPassword = await bcrypt.hash(password, 10);
        const queryText = `
            INSERT INTO users (username, password) 
            VALUES ($1, $2) 
            RETURNING id, username, created_at;
        `;
        
        const result = await pool.query(queryText, [username, hashedPassword]);
        res.status(201).json({ message: "User created successfully!", user: result.rows[0] });
    } catch (error) {
        // Handle unique constraint violation (Postgres error code 23505)
        if (error.code === '23505') {
            return res.status(409).json({ message: "Username already taken." });
        }
        res.status(500).json({ message: "Internal server error." });
    }
});

/**
 * Route: POST /api/users/login
 * Verifies user credentials using bcrypt.compare
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user) {
            // Compare plaintext input with stored hash
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                return res.json({ message: "Login successful", username: user.username });
            }
        }
        
        res.status(401).json({ message: "Invalid username or password" });
    } catch (error) {
        res.status(500).json({ message: "Server error during login" });
    }
});

/**
 * Route: POST /api/users/gift
 * Validates recipient and simulates sending an energy booster
 */
router.post('/gift', async (req, res) => {
    const { recipient } = req.body;

    if (!recipient) {
        return res.status(400).json({ message: "Recipient username is required." });
    }

    try {
        const result = await pool.query('SELECT username FROM users WHERE username = $1', [recipient]);
        
        if (result.rows.length > 0) {
            return res.json({ message: `Energy Booster successfully sent to ${recipient}!` });
        } else {
            return res.status(404).json({ message: "Recipient not found." });
        }
    } catch (error) {
        console.error("Gifting error:", error);
        res.status(500).json({ message: "Server error during gifting." });
    }
});

/**
 * Route: DELETE /api/users/:username
 * Removes a user account from the database
 */
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