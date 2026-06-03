import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://djspjtvissqhwixokqeo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqc3BqdHZpc3NxaHdpeG9rcWVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyODA4NywiZXhwIjoyMDk1NzA0MDg3fQ.LFfZSPu40GPGdrnCxInSOIQSw1g21uqRi6puM7tsRGM");

async function run() {
  const { data: lpData, error: lpError } = await supabase.from('loyalty_points').insert([{
    point_balance: 0,
    lifetime_points: 0,
    last_activity_at: new Date().toISOString()
  }]).select().single();
  
  if (lpError) {
    console.log("INSERT LP ERROR:", lpError);
    return;
  }
  
  console.log("INSERT LP SUCCESS:", lpData.id);
  
  const { data: pcData, error: pcError } = await supabase.from('profile_customers').insert([{
    user_id: '91c51316-493e-42de-9905-a61bfd72c666', // fake user
    email: 'test_insert@example.com',
    full_name: 'Test Insert',
    loyalty_point_id: lpData.id
  }]).select().single();
  
  if (pcError) {
    console.log("INSERT PC ERROR:", JSON.stringify(pcError, null, 2));
  } else {
    console.log("INSERT PC SUCCESS:", pcData);
  }
}
run();
