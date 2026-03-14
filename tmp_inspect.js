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

async function inspectTeams() {
  const { data: users } = await supabase.from('employees').select('user_id, email');
  console.log("Employees:", users);

  const { data: workspaces } = await supabase.from('workspaces').select('id, name, owner_id');
  console.log("Workspaces:", workspaces);
  
  const { data: members } = await supabase.from('workspace_members').select('*');
  console.log("Workspace Members:", members);
}

inspectTeams();
