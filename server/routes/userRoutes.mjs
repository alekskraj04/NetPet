import express from 'express';
import pool from '../db.mjs';
import bcrypt from 'bcrypt';

const router = express.Router();

// 1. Create User with Password Hashing
router.post('/', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // Sikker lagring: Hasher passordet før det lagres i PostgreSQL
        const hashedPassword = await bcrypt.hash(password, 10);

        const queryText = `
            INSERT INTO users (username, password) 
            VALUES ($1, $2) 
            RETURNING id, username, created_at;
        `;
        
        const result = await pool.query(queryText, [username, hashedPassword]);
        const newUser = result.rows[0];

        console.log(`User created with hashed password: ${username}`);
        
        res.status(201).json({
            message: "User created successfully!",
            user: newUser
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: "Username already taken." });
        }
        console.error("Database error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// 2. Get Users (For simple login verification)
router.get('/', async (req, res) => {
    try {
        // Vi henter brukernavn og det hashede passordet for å sjekke mot login
        const result = await pool.query('SELECT username, password FROM users');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch users." });
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