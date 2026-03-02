import express from 'express';
const router = express.Router();

// 1. Create User Account
// Base route is /api/users, so we only need '/' here
router.post('/', (req, res) => {
    const { username, email, consentToToS } = req.body;

    if (!consentToToS) {
        return res.status(400).json({ 
            message: "You must accept the Terms of Service to create an account." 
        });
    }

    console.log(`User created: ${username} (${email})`);
    
    res.status(201).json({
        message: "User created successfully!",
        user: { 
            username, 
            email, 
            consentDate: new Date().toISOString() 
        }
    });
});

// 2. Delete Account
router.delete('/:username', (req, res) => {
    const username = req.params.username;
    console.log(`Deleting all data for user: ${username}`);

    res.json({ 
        message: `The account for ${username} and all associated data has been deleted.` 
    });
});

// In .mjs we use export default instead of module.exports
export default router;