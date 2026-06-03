import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://djspjtvissqhwixokqeo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqc3BqdHZpc3NxaHdpeG9rcWVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyODA4NywiZXhwIjoyMDk1NzA0MDg3fQ.LFfZSPu40GPGdrnCxInSOIQSw1g21uqRi6puM7tsRGM");

async function run() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test_error_check@example.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { display_name: 'Test User' }
  });
  if (error) {
    console.log("EXACT ERROR:", error);
  } else {
    console.log("SUCCESS:", data.user.id);
  }
}
run();
