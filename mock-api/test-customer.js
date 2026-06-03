import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://djspjtvissqhwixokqeo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqc3BqdHZpc3NxaHdpeG9rcWVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyODA4NywiZXhwIjoyMDk1NzA0MDg3fQ.LFfZSPu40GPGdrnCxInSOIQSw1g21uqRi6puM7tsRGM");

async function run() {
  const { data, error } = await supabase.from('customer').select('*').eq('id', '56a3576b-bc3a-46f3-8fe7-a4789f74bdd5');
  console.log("Customer:", data, error);
}
run();
