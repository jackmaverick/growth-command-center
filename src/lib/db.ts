import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool() {
    if (pool) return pool;

    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("POSTGRES_URL / DATABASE_URL is not set");
    }

    pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });

    return pool;
}
