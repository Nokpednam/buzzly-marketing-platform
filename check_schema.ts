
import pg from 'pg';

const connectionString = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function main() {
    const client = new pg.Client({ connectionString });

    try {
        await client.connect();
        console.log("Connected.");

        // Check columns of subscriptions
        const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'subscriptions'");
        console.log("Subscriptions columns:", cols.rows.map(r => r.column_name));

        // Check FKs to payment_methods
        const fks = await client.query(`
      SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'payment_methods';
    `);

        console.table(fks.rows.map(r => ({ table: r.table_name, column: r.column_name, constraint: r.constraint_name })));

        const fs = await import('fs');
        fs.writeFileSync('fks.json', JSON.stringify(fks.rows, null, 2), 'utf-8');
        console.log("Written to fks.json");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

main();
