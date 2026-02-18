
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars (VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY)");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("--- Payment Methods (Anon) ---");
    const { data: methods, error: methodsError } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_active", true); // Simulating the hook

    if (methodsError) console.error(methodsError);
    else console.table(methods);

    console.log("\n--- Subscription Plans (Anon) ---");
    const { data: plans, error: plansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true);

    if (plansError) console.error(plansError);
    else {
        console.table(plans?.map(p => ({
            name: p.name,
            monthly: p.price_monthly,
            yearly: p.price_yearly,
            savings: p.price_monthly > 0 ? Math.round(((p.price_monthly - (p.price_yearly / 12)) / p.price_monthly) * 100) : 0
        })));
    }
}

main();
