
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Variables");
    process.exit(1);
}

// Create client with SERVICE ROLE key if possible to bypass RLS for debugging "Absolute Truth", 
// BUT we want to check what the USER sees. 
// However, since we can't easily login as user here without credentials, 
// let's first check "Absolute Truth" using Service Role (if available) or Anon (which might fail if RLS is strict).
// Actually, let's look at the data structure first.

// We will use the provided key (Anon) but we might need to assume a user identity if we want to test RLS.
// For now, let's just query normally. If it returns [] it means RLS is blocking or no data.

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDashboardData() {
    console.log("--- Debugging Dashboard Data ---");

    // 1. Check Ad Insights Dates and Counts (Global - might fail if RLS)
    // To properly debug "Why isn't it showing", we need to see if ANY data exists for the current user context.
    // Since we are running outside the browser, we don't have the user's session.
    // So let's just dump the top 10 rows of ad_insights and see their dates and ad_account_ids
    // Note: This will likely return EMPTY if RLS is effectively blocking ANON access.

    // So I will attempt to sign in if possible, or just list with a known user ID if I can find one?
    // Let's assume we can't sign in. I'll rely on listing assuming my previous policy allowing "anon" (no, I didn't allow anon).

    // Plan B: I will use a direct SQL query via `psql` if I had access, but I don't.
    // I will try to use the `supabase` object which executes in the context of the provided key. 
    // If I use the ANON key, I am Anon.

    console.log("Fetching ad_insights (as Anon)...");
    const { data: insights, error: iErr } = await supabase
        .from('ad_insights')
        .select('date, ad_account_id, impressions')
        .limit(10);

    if (iErr) console.error("Error fetching insights:", iErr);
    else {
        console.log(`Found ${insights?.length ?? 0} rows as Anon.`);
        if (insights && insights.length > 0) {
            console.log("Sample Data:", insights);
        } else {
            console.log("No data visible as Anon. This is expected if RLS is ON.");
        }
    }

    // 2. Check Ad Accounts
    console.log("Fetching ad_accounts...");
    const { data: accounts, error: aErr } = await supabase
        .from('ad_accounts')
        .select('*');

    if (aErr) console.error("Error fetching accounts:", aErr);
    else console.log("Ad Accounts visible:", accounts);

}

debugDashboardData();
