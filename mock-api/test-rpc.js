import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://djspjtvissqhwixokqeo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqc3BqdHZpc3NxaHdpeG9rcWVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyODA4NywiZXhwIjoyMDk1NzA0MDg3fQ.LFfZSPu40GPGdrnCxInSOIQSw1g21uqRi6puM7tsRGM");

async function run() {
  const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test_error_check@example.com',
    password: 'password123'
  });
  
  if (signInError) {
    console.log("Sign In Error:", signInError);
    return;
  }

  const { data, error } = await supabase.rpc('award_loyalty_points', { p_action_type: 'create_workspace' });
  if (error) {
    console.log("RPC ERROR:", error);
  } else {
    console.log("RPC SUCCESS:", data);
  }
}
run();
