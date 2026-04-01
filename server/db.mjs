import pg from 'pg';

/**
 * NOTE FOR SENSOR:
 * This file was updated on April 1st, 2026, after the initial deadline.
 * REASON: The original database instance on Render was renewed/deleted, 
 * requiring a migration to a new PostgreSQL 18 instance. 
 * I also moved the connection string to an environment variable (process.env.DATABASE_URL)
 * to follow security best practices and ensure the app remains functional on the new host.
 */

const connectionString = process.env.DATABASE_URL;

const { Pool } = pg;
const pool = new Pool({
    connectionString,
    // SSL is required for Render's managed PostgreSQL instances
    ssl: connectionString && !connectionString.includes('localhost') 
        ? { rejectUnauthorized: false } 
        : false
});

export async function initializeDatabase() {
    const queryText = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,        
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        if (!connectionString) {
            throw new Error("DATABASE_URL is missing. Please check Render environment variables.");
        }
        await pool.query(queryText);
        console.log("Database initialized successfully.");
    } catch (error) {
        console.error("Database initialization failed:", error);
    }
}

export default pool;