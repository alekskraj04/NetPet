const express = require('express');
const calculateDecay = require('./middleware/petStatus'); // Your middleware
const app = express();
app.use(express.json());

// 1. GET: Fetch pet status (Uses your middleware to calculate hunger/energy)
app.get('/api/pet/:id', calculateDecay, (req, res) => {
    res.json({ 
        id: req.params.id, 
        name: "Pixel", 
        status: "Updated",
        calculatedDecay: req.decayStats 
    });
});

// 2. PATCH: Interact with pet (Feeding, playing, etc.)
app.patch('/api/pet/:id/interact', (req, res) => {
    const { action } = req.body;
    res.json({ message: `Action '${action}' successful for pet ${req.params.id}` });
});

// 3. GET: Search for other pets (Social feature)
app.get('/api/pets/search', (req, res) => {
    const { name } = req.query;
    res.json({ results: [{ id: "2", name: name || "Buddy", owner: "Friend123" }] });
});

// 4. POST: Send a gift to a friend (Sharing feature)
app.post('/api/pets/:id/gift', (req, res) => {
    res.status(201).json({ message: `Gift sent to pet ${req.params.id}` });
});

// 5. POST: Create a new pet (Registration feature)
app.post('/api/pets', (req, res) => {
    const { petName, appearance } = req.body;
    res.status(201).json({ message: `Pet ${petName} created with ${appearance} style!` });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`NetPet API running on port ${PORT}`));



// --- USER API (New for "Users and more" assignment) ---

// 1. Create User Account
// Requirement: Must actively consent to ToS/Privacy Policy
app.post('/api/users', (req, res) => {
    const { username, email, consentToToS } = req.body;

    if (!consentToToS) {
        return res.status(400).json({ 
            message: "Du må akseptere Terms of Service for å opprette en konto." 
        });
    }

    // Her ville vi vanligvis lagret i en database, men oppgaven sier "Do not make a database"
    console.log(`Bruker opprettet: ${username} (${email})`);
    
    res.status(201).json({
        message: "Bruker opprettet suksessfullt!",
        user: { username, email, consentDate: new Date().toISOString() }
    });
});

// 2. Delete Account (Right to be forgotten)
// Requirement: Potential users can retract consent and delete account
app.delete('/api/users/:username', (req, res) => {
    const username = req.params.username;

    // Her simulerer vi sletting av all personlig data (GDPR-prinsippet)
    console.log(`Sletter all data for bruker: ${username}`);

    res.json({ 
        message: `Kontoen til ${username} og all tilhørende data er slettet.` 
    });
});