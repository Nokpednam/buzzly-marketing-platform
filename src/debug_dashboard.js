
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env because dotenv might not be working in this env
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

let envVars = {};

function parseEnv(filePath) {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        content.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
            }
        });
    }
}

parseEnv(envPath);
parseEnv(envLocalPath);

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
// Try to get service role key if available for debugging
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Variables");
    console.log("Found keys:", Object.keys(envVars));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey);

async function debug() {
    console.log("--- Debugging ---");
    console.log("Using key type:", serviceRoleKey ? "SERVICE_ROLE (God Mode)" : "ANON (Public)");

    // 1. Check Ad Insights (Last 10 items)
    const { data: insights, error: iErr } = await supabase
        .from('ad_insights')
        .select('date, ad_account_id, impressions, clicks, spend')
        .order('date', { ascending: false })
        .limit(10);

    if (iErr) console.error("Error fetching insights:", iErr);
    else {
        console.log(`Found ${insights?.length ?? 0} rows in ad_insights.`);
        console.dir(insights, { depth: null });
    }

    // 2. Check Ad Accounts
    const { data: accounts, error: aErr } = await supabase
        .from('ad_accounts')
        .select('id, account_name, team_id, platform_id');

    if (aErr) console.error("Error fetching accounts:", aErr);
    else {
        console.log(`Found ${accounts?.length ?? 0} rows in ad_accounts.`);
        console.dir(accounts, { depth: null });
    }
}

debug();
