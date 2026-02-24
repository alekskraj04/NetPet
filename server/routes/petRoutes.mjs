import express from 'express';
const router = express.Router();

// I .mjs må vi bruke 'import' og inkludere hele filnavnet med .mjs
import calculateDecay from '../middleware/petStatus.mjs'; 

// 1. GET: Fetch pet status
router.get('/:id', calculateDecay, (req, res) => {
    res.json({ 
        id: req.params.id, 
        name: "Pixel", 
        status: "Updated",
        calculatedDecay: req.decayStats 
    });
});

// 2. PATCH: Interact with pet
router.patch('/:id/interact', (req, res) => {
    const { action } = req.body;
    res.json({ message: `Action '${action}' successful for pet ${req.params.id}` });
});

// 3. GET: Search for other pets
router.get('/search', (req, res) => {
    const { name } = req.query;
    res.json({ results: [{ id: "2", name: name || "Buddy", owner: "Friend123" }] });
});

// 4. POST: Send a gift to a friend
router.post('/:id/gift', (req, res) => {
    res.status(201).json({ message: `Gift sent to pet ${req.params.id}` });
});

// 5. POST: Create a new pet
router.post('/', (req, res) => {
    const { petName, appearance } = req.body;
    res.status(201).json({ message: `Pet ${petName} created with ${appearance} style!` });
});

// Eksporterer routeren med ES Module-syntaks
export default router;