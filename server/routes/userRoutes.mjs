import express from 'express';
import pool from '../db.mjs'; // Vi importerer tilkoblingen vår

const router = express.Router();

// 1. Create User Account (Saves to PostgreSQL)
router.post('/', async (req, res) => {
    // Vi henter ut det som sendes fra nettsiden
    const { username, email } = req.body;

    // Vi fjerner sjekken på consentToToS for at knappen skal virke nå
    if (!username || !email) {
        return res.status(400).json({ 
            message: "Username and email are required." 
        });
    }

    try {
        // SQL query som legger til brukeren
        // Vi setter inn et 'placeholder_password' siden databasen din krever et passord-felt
        const queryText = `
            INSERT INTO users (username, password) 
            VALUES ($1, $2) 
            RETURNING id, created_at;
        `;
        
        // Vi sender brukernavnet og et midlertidig passord til databasen
        const values = [username, 'placeholder_password123'];
        
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
        
        // Hvis brukernavnet allerede finnes
        if (error.code === '23505') {
            return res.status(409).json({ message: "Username already taken." });
        }
        
        res.status(500).json({ message: "Internal server error." });
    }
});

// 2. Delete Account
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
        console.error("❌ Database error during deletion:", error);
        res.status(500).json({ message: "Could not delete user." });
    }
});

export default router;