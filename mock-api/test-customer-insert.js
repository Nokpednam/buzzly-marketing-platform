import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://djspjtvissqhwixokqeo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqc3BqdHZpc3NxaHdpeG9rcWVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyODA4NywiZXhwIjoyMDk1NzA0MDg3fQ.LFfZSPu40GPGdrnCxInSOIQSw1g21uqRi6puM7tsRGM");

async function run() {
  const { data, error } = await supabase.from('customer').insert([{
    id: 'ce460f4b-97d1-4971-b306-7ee8a24b7595', // Use existing auth user ID
    email: 'test_123@example.com',
    full_name: 'test_123@example.com',
    plan_type: 'free',
    acquisition_source: null
  }]);
  
  if (error) {
    console.log("INSERT ERROR:", error);
  } else {
    console.log("INSERT SUCCESS:", data);
  }
}
run();
