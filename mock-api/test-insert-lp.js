import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://djspjtvissqhwixokqeo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqc3BqdHZpc3NxaHdpeG9rcWVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyODA4NywiZXhwIjoyMDk1NzA0MDg3fQ.LFfZSPu40GPGdrnCxInSOIQSw1g21uqRi6puM7tsRGM");

async function run() {
  const { data, error } = await supabase.from('loyalty_points').insert([{
    point_balance: 0,
    lifetime_points: 0,
    last_activity_at: new Date().toISOString()
  }]).select();
  
  if (error) {
    console.log("INSERT LP ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("INSERT LP SUCCESS:", data);
  }
}
run();
