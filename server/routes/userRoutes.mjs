import express from 'express';
import pool from '../db.mjs'; // Vi importerer tilkoblingen vår

const router = express.Router();

// 1. Create User Account (Saves to PostgreSQL)
router.post('/', async (req, res) => {
    const { username, email, password, consentToToS } = req.body;

    // Check if Terms of Service is accepted
    if (!consentToToS) {
        return res.status(400).json({ 
            message: "You must accept the Terms of Service to create an account." 
        });
    }

    try {
        // SQL query to insert a new user
        // Note: I added 'password' here since our table has a password column
        const queryText = `
            INSERT INTO users (username, password) 
            VALUES ($1, $2) 
            RETURNING id, created_at;
        `;
        
        // We use email as a temporary password placeholder if your frontend 
        // doesn't send a password yet, or just use the password from req.body
        const values = [username, password || 'temporary_password'];
        
        const result = await pool.query(queryText, values);
        const newUser = result.rows[0];

        console.log(` User saved to DB: ${username}`);
        
        res.status(201).json({
            message: "User created successfully in database!",
            user: { 
                id: newUser.id,
                username, 
                createdAt: newUser.created_at
            }
        });
    } catch (error) {
        console.error(" Database error during registration:", error);
        
        // Handle unique constraint violation (if user already exists)
        if (error.code === '23505') {
            return res.status(409).json({ message: "Username already taken." });
        }
        
        res.status(500).json({ message: "Internal server error." });
    }
});

// 2. Delete Account (Deletes from PostgreSQL)
router.delete('/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const queryText = 'DELETE FROM users WHERE username = $1';
        await pool.query(queryText, [username]);

        console.log(` Deleted user from DB: ${username}`);
        res.json({ 
            message: `The account for ${username} has been deleted from the database.` 
        });
    } catch (error) {
        console.error(" Database error during deletion:", error);
        res.status(500).json({ message: "Could not delete user." });
    }
});

export default router;