import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.mjs';
import petRoutes from './routes/petRoutes.mjs';

// Disse to linjene er nødvendige i .mjs for at path.join(__dirname) skal fungere
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());

// Serve static files from the client folder
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`NetPet API running on http://localhost:${PORT}`);
});