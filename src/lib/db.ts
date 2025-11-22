import { Pool } from "pg";

function buildConnectionString() {
    const direct =
        process.env.POSTGRES_URL ||
        process.env.DATABASE_URL ||
        process.env.POSTGRES_PRISMA_URL;

    if (direct) return direct;

    const { PGUSER, PGPASSWORD, PGHOST, PGDATABASE } = process.env;
    if (PGUSER && PGPASSWORD && PGHOST && PGDATABASE) {
        return `postgresql://${PGUSER}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}/${PGDATABASE}?sslmode=require`;
    }

    throw new Error("No Postgres connection string found; set POSTGRES_URL or DATABASE_URL");
}

let pool: Pool | null = null;

export function getPool() {
    if (pool) return pool;

    const connectionString = buildConnectionString();

    pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });

    return pool;
}
