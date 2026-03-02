import pg from 'pg';

const connectionString = "postgresql://netpet_user:1y7xAFb1QkpHdtU9XLF3x8ipsoktlqtB@dpg-d6iu1r3h46gs73acg0m0-a.frankfurt-postgres.render.com/netpet";

const { Pool } = pg;
const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

/**
 * Initializes the database by creating necessary tables if they don't exist.
 */
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
        await pool.query(queryText);
        console.log(" Database tables are ready!");
    } catch (error) {
        console.error(" Error initializing database:", error);
    }
}

export default pool;