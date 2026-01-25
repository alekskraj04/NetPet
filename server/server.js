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