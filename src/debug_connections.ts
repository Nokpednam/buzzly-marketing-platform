
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://xpmswnktazcjpqumrfsh.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

// IF variables are not found, we might need to hardcode or ask user. 
// But let's try to assume them if standard.

if (!supabaseKey) {
    console.error("No SUPABASE_URL or ANNON_KEY found in env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnections() {
    console.log("Checking connections...");

    // 1. Get User
    // We can't get authenticated user easily in script unless we sign in.
    // So let's just list all platforms and api keys to see if ANY exist.

    // 2. Platforms
    const { data: platforms, error: pErr } = await supabase.from('platforms').select('*');
    if (pErr) console.error("Platforms Error:", pErr);
    else console.log("Platforms:", platforms);

    // 3. API Keys
    const { data: keys, error: kErr } = await supabase.from('workspace_api_keys').select('*');
    if (kErr) console.error("Keys Error:", kErr);
    else console.log("Workspace API Keys:", keys);

}

checkConnections();
