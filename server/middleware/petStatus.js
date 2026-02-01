// middleware/petStatus.js
const calculateDecay = (req, res, next) => {
    console.log("Middleware trigger: Calculating pet decay...");
    
    // Normally we would fetch 'lastInteraction' from the database
    const lastInteraction = Date.now() - (1000 * 60 * 60); // Simulates 1 hour ago
    const hoursPassed = (Date.now() - lastInteraction) / (1000 * 60 * 60);
    
    // Adding calculated hunger increase to the request object
    req.decayStats = {
        hungerIncrease: Math.floor(hoursPassed * 10), // 10 hunger points per hour
        energyLoss: Math.floor(hoursPassed * 5)
    };

    next(); // Proceed to the API endpoint
};

module.exports = calculateDecay;