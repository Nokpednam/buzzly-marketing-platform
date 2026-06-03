import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://djspjtvissqhwixokqeo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqc3BqdHZpc3NxaHdpeG9rcWVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyODA4NywiZXhwIjoyMDk1NzA0MDg3fQ.LFfZSPu40GPGdrnCxInSOIQSw1g21uqRi6puM7tsRGM");

async function run() {
  const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'loyalty_points' });
  if (error) {
    console.log("RPC Error:", error.message);
  } else {
    console.log("Schema:", data);
  }
}
run();
