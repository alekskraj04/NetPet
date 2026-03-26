import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db.mjs'; 
import userRoutes from './routes/userRoutes.mjs';
import petRoutes from './routes/petRoutes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global Middleware
app.use(express.json());

/**
 * Static File Serving
 * 1. Serve game assets (images, gifs)
 * 2. Serve client-side files (HTML, CSS, JS modules)
 */
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../client')));

// API Routes Configuration
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);

// Root route to serve the main frontend entry point
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

const PORT = process.env.PORT || 3000;

/**
 * Server Initialization
 * Ensures the database is connected/initialized before the server starts listening
 */
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`NetPet API running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to start server due to database error:", err);
});