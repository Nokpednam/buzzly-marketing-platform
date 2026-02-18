
import pg from 'pg';
import fs from 'fs';

const connectionString = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function main() {
    const client = new pg.Client({ connectionString });

    try {
        await client.connect();
        const res = await client.query("SELECT * FROM public.payment_methods ORDER BY id");
        fs.writeFileSync("payment_methods.json", JSON.stringify(res.rows, null, 2));
        console.log("Written to payment_methods.json");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

main();
