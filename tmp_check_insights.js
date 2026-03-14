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

async function checkInsights() {
  const { data, error } = await supabase
    .from('ad_insights')
    .select('id, ad_account_id, impressions, date, ad_accounts!inner(is_active, platform_id, platforms(slug, name))')
    .eq('ad_accounts.is_active', true)
    .limit(10);

  if (error) {
    console.error('Error:', error);
  } else {
    // Group by platform to see what we have
    const platforms = new Set();
    data.forEach(row => {
      platforms.add(row.ad_accounts?.platforms?.slug || 'unknown');
    });
    console.log(`Found active insights for platforms: ${Array.from(platforms).join(', ')}`);
    if (data.length > 0) {
      console.log('Sample rows:', JSON.stringify(data.slice(0, 2), null, 2));
    }
  }

  // Also check active ad accounts directly
  const { data: accounts, error: accError } = await supabase
    .from('ad_accounts')
    .select('id, account_name, platform_id, is_active, platforms(slug, name)');
  
  if (!accError) {
    console.log('\nAll Ad Accounts Context:');
    accounts.forEach(a => {
      console.log(`- ${a.account_name} | is_active: ${a.is_active} | platform: ${a.platforms?.slug}`);
    });
  }
}

checkInsights();
