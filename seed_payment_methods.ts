
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const methods = [
    {
        name: "Credit/Debit Card",
        slug: "credit_card",
        description: "Pay with Visa, Mastercard, JCB, AMEX",
        is_active: true,
        display_order: 1
    },
    {
        name: "Thai QR Payment",
        slug: "promptpay",
        description: "Scan QR code to pay instantly",
        is_active: true,
        display_order: 2
    },
    {
        name: "Bank Transfer",
        slug: "bank_transfer",
        description: "Direct bank transfer to company account",
        is_active: true,
        display_order: 3
    }
];

async function main() {
    console.log("Seeding payment methods...");

    for (const method of methods) {
        const { data: existing, error: checkError } = await supabase
            .from('payment_methods')
            .select('id')
            .eq('slug', method.slug)
            .maybeSingle();

        if (checkError) {
            console.error(`Error checking ${method.slug}:`, checkError);
            continue;
        }

        if (!existing) {
            const { error: insertError } = await supabase
                .from('payment_methods')
                .insert(method);

            if (insertError) {
                console.error(`Error inserting ${method.slug}:`, insertError);
            } else {
                console.log(`Inserted ${method.slug}`);
            }
        } else {
            // Ensure it's active
            const { error: updateError } = await supabase
                .from('payment_methods')
                .update({ is_active: true, description: method.description, name: method.name })
                .eq('id', existing.id);

            if (updateError) {
                console.error(`Error updating ${method.slug}:`, updateError);
            } else {
                console.log(`Updated/Verified ${method.slug}`);
            }
        }
    }
    console.log("Done.");
}

main();
