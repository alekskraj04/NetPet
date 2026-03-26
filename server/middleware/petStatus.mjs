// middleware/petStatus.mjs

/**
 * Middleware to calculate pet status decay based on time passed since last interaction.
 */
const calculateDecay = (req, res, next) => {
    console.log("Middleware trigger: Calculating pet decay...");
    
    // Simulating that the last interaction was 1 hour ago for calculation purposes
    const lastInteraction = Date.now() - (1000 * 60 * 60); 
    const hoursPassed = (Date.now() - lastInteraction) / (1000 * 60 * 60);
    
    // Attach calculated decay values to the request object for use in route handlers
    req.decayStats = {
        hungerIncrease: Math.floor(hoursPassed * 10), // 10 hunger points per hour
        energyLoss: Math.floor(hoursPassed * 5)       // 5 energy points per hour
    };

    next(); // Proceed to the next function/route handler
};

export default calculateDecay;