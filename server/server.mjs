import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db.mjs'; 
import userRoutes from './routes/userRoutes.mjs';
import petRoutes from './routes/petRoutes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());

// 1. VIKTIG: Gjør assets-mappen tilgjengelig for nettleseren
// Dette gjør at <img src="/assets/..."> fungerer på Render
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// 2. Serve statiske filer fra client-mappen (css, js, views)
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);

// Enkel rute for å servere index.html som hovedside
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

const PORT = process.env.PORT || 3000;

// Initialize database before starting the server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`NetPet API running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Failed to start server due to database error:", err);
});