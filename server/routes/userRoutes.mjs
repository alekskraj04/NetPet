import express from 'express';
const router = express.Router();

// 1. Create User Account
// Baseruten er /api/users, så vi trenger bare '/' her
router.post('/', (req, res) => {
    const { username, email, consentToToS } = req.body;

    if (!consentToToS) {
        return res.status(400).json({ 
            message: "Du må akseptere Terms of Service for å opprette en konto." 
        });
    }

    console.log(`Bruker opprettet: ${username} (${email})`);
    
    res.status(201).json({
        message: "Bruker opprettet suksessfullt!",
        user: { username, email, consentDate: new Date().toISOString() }
    });
});

// 2. Delete Account
router.delete('/:username', (req, res) => {
    const username = req.params.username;
    console.log(`Sletter all data for bruker: ${username}`);

    res.json({ 
        message: `Kontoen til ${username} og all tilhørende data er slettet.` 
    });
});

// I .mjs bruker vi export default i stedet for module.exports
export default router;