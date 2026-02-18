
import pg from 'pg';

const connectionString = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function main() {
    const client = new pg.Client({ connectionString });

    try {
        await client.connect();
        console.log("Connected.");

        // Inspect Schema
        const schemaRes = await client.query("SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'payment_methods'");
        console.table(schemaRes.rows);

        // 1. Seed Payment Methods
        const methods = [
            { name: 'Credit/Debit Card', slug: 'credit_card', desc: 'Pay with Visa, Mastercard, JCB, AMEX', is_active: true, display_order: 1 },
            { name: 'Thai QR Payment', slug: 'promptpay', desc: 'Scan QR code to pay instantly', is_active: true, display_order: 2 },
            { name: 'Bank Transfer', slug: 'bank_transfer', desc: 'Direct bank transfer to company account', is_active: true, display_order: 3 }
        ];

        for (const m of methods) {
            const checkRes = await client.query("SELECT id FROM public.payment_methods WHERE slug = $1", [m.slug]);

            if (checkRes.rowCount === 0) {
                console.log(`Inserting ${m.slug}...`);
                try {
                    // Try inserting. If ID is needed, it might fail if no default.
                    await client.query(
                        "INSERT INTO public.payment_methods (name, slug, description, is_active, display_order) VALUES ($1, $2, $3, $4, $5)",
                        [m.name, m.slug, m.desc, m.is_active, m.display_order]
                    );
                } catch (insertErr: any) {
                    console.error(`Insert failed for ${m.slug}:`, insertErr.message);
                    // If ID missing, try generating one? But PG usually has default.
                    if (insertErr.message && insertErr.message.includes("null value in column \"id\"")) {
                        console.log("Retrying with explicit ID...");
                        await client.query(
                            "INSERT INTO public.payment_methods (id, name, slug, description, is_active, display_order) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)",
                            [m.name, m.slug, m.desc, m.is_active, m.display_order]
                        );
                    } else {
                        throw insertErr;
                    }
                }
            } else {
                console.log(`Updating ${m.slug}...`);
                await client.query(
                    "UPDATE public.payment_methods SET is_active = $1, display_order = $2 WHERE slug = $3",
                    [m.is_active, m.display_order, m.slug]
                );
            }
        }
        console.log("Payment methods processed.");

        // 2. Update Plan Prices
        console.log("Updating Plan Prices...");
        await client.query("UPDATE public.subscription_plans SET price_yearly = 9590 WHERE name = 'Pro'");
        await client.query("UPDATE public.subscription_plans SET price_yearly = 23990 WHERE name = 'Team'");

        console.log("Migration applied successfully!");

    } catch (err: any) {
        console.error("Fatal Error:", err.message);
        if (err.detail) console.error("Detail:", err.detail);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
