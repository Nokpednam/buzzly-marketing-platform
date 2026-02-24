import pg from 'pg';
const client = new pg.Client({ connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres" });

async function main() {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%point_%'");
    console.log("Tables:", res.rows);
    await client.end();
}

main();
