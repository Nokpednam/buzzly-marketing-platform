import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://djspjtvissqhwixokqeo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqc3BqdHZpc3NxaHdpeG9rcWVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyODA4NywiZXhwIjoyMDk1NzA0MDg3fQ.LFfZSPu40GPGdrnCxInSOIQSw1g21uqRi6puM7tsRGM");

async function run() {
  const email = `test_${Date.now()}@example.com`;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
    user_metadata: { display_name: 'Test User' }
  });
  if (error) {
    console.log("SIGNUP ERROR:", error);
    return;
  }
  console.log("SUCCESS SIGNUP:", data.user.id);
  
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: 'password123'
  });
  
  if (signInError) {
    console.log("SIGN IN ERROR:", signInError);
    return;
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc('award_loyalty_points', { p_action_type: 'create_workspace' });
  if (rpcError) {
    console.log("RPC ERROR:", rpcError);
  } else {
    console.log("RPC SUCCESS:", rpcData);
  }
}
run();
