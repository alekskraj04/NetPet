import express from 'express';
const router = express.Router();
import calculateDecay from '../middleware/petStatus.mjs'; 

/**
 * Route: GET /api/pets/:id
 * Fetches pet status with calculated decay middleware
 */
router.get('/:id', calculateDecay, (req, res) => {
    res.json({ 
        id: req.params.id, 
        name: "Pixel", 
        status: "Updated",
        calculatedDecay: req.decayStats 
    });
});

/**
 * Route: PATCH /api/pets/:id/interact
 * Handles interactions like feeding or playing
 */
router.patch('/:id/interact', (req, res) => {
    const { action } = req.body;
    res.json({ message: `Action '${action}' successful for pet ${req.params.id}` });
});

/**
 * Route: GET /api/pets/search
 * Search functionality for finding other pets/users
 */
router.get('/search', (req, res) => {
    const { name } = req.query;
    res.json({ results: [{ id: "2", name: name || "Buddy", owner: "Friend123" }] });
});

/**
 * Route: POST /api/pets/:id/gift
 * Sends a gift or energy booster to another pet
 */
router.post('/:id/gift', (req, res) => {
    res.status(201).json({ message: `Gift sent to pet ${req.params.id}` });
});

/**
 * Route: POST /api/pets/
 * Creates a new pet entry in the database
 */
router.post('/', (req, res) => {
    const { petName, appearance } = req.body;
    res.status(201).json({ message: `Pet ${petName} created with ${appearance} style!` });
});

export default router;