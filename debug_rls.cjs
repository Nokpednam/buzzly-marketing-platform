
const { createClient } = require('@supabase/supabase-js');

// Using service role to bypass RLS for debugging
const supabase = createClient(
  process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'service_role_key'
);

async function check() {
  const campaignId = 'a0c0c0cd-fd19-4d3f-ac4d-fa8ca67659c0';
  
  console.log('--- Checking Campaign ---');
  const { data: campaign, error: cError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();
    
  if (cError) console.error('Error fetching campaign:', cError);
  else console.log('Campaign:', campaign);

  if (campaign) {
    console.log('\n--- Checking Workspace ---');
    const { data: workspace, error: wError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', campaign.team_id)
      .maybeSingle();
      
    if (wError) console.error('Error fetching workspace:', wError);
    else console.log('Workspace:', workspace);

    console.log('\n--- Checking Workspace Members ---');
    const { data: members, error: mError } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('team_id', campaign.team_id);
      
    if (mError) console.error('Error fetching members:', mError);
    else console.log('Members:', members);
  }

  // Check all campaigns with NULL team_id
  const { count, error: countError } = await supabase
    .from('campaigns')
    .select('id', { count: 'exact', head: true })
    .is('team_id', null);
    
  if (countError) console.error('Error counting NULL team_id:', countError);
  else console.log('\nCampaigns with NULL team_id:', count);
}

check();
