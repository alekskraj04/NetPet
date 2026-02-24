// middleware/petStatus.mjs

const calculateDecay = (req, res, next) => {
    console.log("Middleware trigger: Calculating pet decay...");
    
    // Simulerer at siste interaksjon var for 1 time siden
    const lastInteraction = Date.now() - (1000 * 60 * 60); 
    const hoursPassed = (Date.now() - lastInteraction) / (1000 * 60 * 60);
    
    // Legger beregnede verdier til request-objektet
    req.decayStats = {
        hungerIncrease: Math.floor(hoursPassed * 10), // 10 sultpoeng per time
        energyLoss: Math.floor(hoursPassed * 5)
    };

    next(); // Gå videre til neste funksjon (API-endepunktet)
};

// I .mjs bruker vi export default
export default calculateDecay;