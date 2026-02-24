import fs from 'fs';
import path from 'path';
import pg from 'pg';

const connectionString = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function main() {
    const client = new pg.Client({ connectionString });

    try {
        await client.connect();
        console.log("Connected to local Postgres.");

        const sqlFilePath = path.join(process.cwd(), 'supabase', 'migrations', '20260224150000_gamification_rewards.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log("Running migration script for Gamification & Rewards...");
        await client.query(sql);

        console.log("Migration applied successfully!");
    } catch (err: any) {
        console.error("Migration Failed:", err.message);
        if (err.detail) console.error("Detail:", err.detail);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
