
import pg from 'pg';

const connectionString = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function main() {
    const client = new pg.Client({ connectionString });

    try {
        await client.connect();
        console.log("Connected.");

        // 1. Get IDs
        const oldRes = await client.query("SELECT id FROM public.payment_methods WHERE slug = 'card'");
        const newRes = await client.query("SELECT id FROM public.payment_methods WHERE slug = 'credit_card'");

        if (oldRes.rowCount === 0) {
            console.log("Old method not found. Already cleaned?");
            return;
        }
        if (newRes.rowCount === 0) {
            console.error("New method (credit_card) not found!");
            return;
        }

        const oldId = oldRes.rows[0].id;
        const newId = newRes.rows[0].id;

        console.log(`Reassigning from ${oldId} (card) to ${newId} (credit_card)...`);

        // 2. Find referencing tables (Optional, but good for debugging. I'll just update known/likely ones)
        // Tables: payment_transactions, customer_payment_methods?
        // Let's just try updating payment_transactions first.

        await client.query("UPDATE public.payment_transactions SET payment_method_id = $1 WHERE payment_method_id = $2", [newId, oldId]);
        console.log("Updated payment_transactions.");

        // Update user_payment_methods (based on fks.json)
        try {
            await client.query("UPDATE public.user_payment_methods SET payment_method_id = $1 WHERE payment_method_id = $2", [newId, oldId]);
            console.log("Updated user_payment_methods.");
        } catch (e: any) {
            console.log("Skipping user_payment_methods update:", e.message);
        }

        // Update subscriptions
        try {
            await client.query("UPDATE public.subscriptions SET payment_method_id = $1 WHERE payment_method_id = $2", [newId, oldId]);
            console.log("Updated subscriptions.");
        } catch (e: any) {
            console.log("Skipping subscriptions update (maybe column missing):", e.message);
        }

        // Update customer (default_payment_method_id)
        try {
            await client.query("UPDATE public.customer SET default_payment_method_id = $1 WHERE default_payment_method_id = $2", [newId, oldId]);
            console.log("Updated customer default_payment_method_id.");
        } catch (e: any) {
            console.log("Skipping customer update:", e.message);
        }

        // Check customer table (default_payment_method?) - usually text or UUID?
        // If there's a FK there.
        // Let's check constraints to be sure.

        // 3. Delete
        console.log("Deleting old payment method...");
        const delRes = await client.query("DELETE FROM public.payment_methods WHERE id = $1", [oldId]);
        console.log(`Deleted ${delRes.rowCount} row(s).`);

        // Verify
        const verifyRes = await client.query("SELECT * FROM public.payment_methods ORDER BY display_order");
        console.table(verifyRes.rows.map(r => ({ slug: r.slug, name: r.name, id: r.id })));

    } catch (err: any) {
        console.error("Error:", err.message);
        if (err.detail) console.error("Detail:", err.detail);
        if (err.table) console.error("Table:", err.table);
        if (err.constraint) console.error("Constraint:", err.constraint);
    } finally {
        await client.end();
    }
}

main();
