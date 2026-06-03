const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL="(.+)"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY="(.+)"/);
const supabase = createClient(urlMatch[1], keyMatch ? keyMatch[1] : env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.+)"/)[1]);

async function run() {
  const { data, error } = await supabase.from('social_posts').select('id, content, post_channel, impressions, likes, reach').limit(10);
  console.log(data);
}
run();
