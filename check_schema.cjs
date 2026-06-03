const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL="(.+)"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY="(.+)"/);
if (!keyMatch) { console.log('No service role key'); process.exit(1); }
const supabase = createClient(urlMatch[1], keyMatch[1]);
async function run() {
  const { data, error } = await supabase.from('social_posts').select('*').limit(1);
  console.log('COLUMNS:', Object.keys(data[0] || {}), error);
}
run();
