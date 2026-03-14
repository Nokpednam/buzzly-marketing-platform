import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('d:/Buzzly_Dev/BuzzlyDev/mock-api/.env', 'utf-8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [key, ...rest] = trimmed.split('=');
  if (key && rest.length > 0) {
    const val = rest.join('=').trim().replace(/^"|"$/g, '');
    env[key.trim()] = val;
  }
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRLS() {
  const { data, error } = await supabase.rpc('get_policies_for_table', { table_name: 'workspace_api_keys' }).catch(() => ({ data: 'RPC not found', error: null }));
  if (data === 'RPC not found') {
    console.log("Cannot easily fetch policies via REST without a custom RPC. Searching for SQL definitions in migrations...");
  } else {
    console.log(data);
  }
}

checkRLS();
