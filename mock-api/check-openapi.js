const fetch = require('node-fetch');
async function run() {
  const url = "https://djspjtvissqhwixokqeo.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqc3BqdHZpc3NxaHdpeG9rcWVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyODA4NywiZXhwIjoyMDk1NzA0MDg3fQ.LFfZSPu40GPGdrnCxInSOIQSw1g21uqRi6puM7tsRGM";
  const res = await fetch(url);
  const data = await res.json();
  const lpSchema = data.definitions.loyalty_points.properties;
  console.log("Loyalty Points columns:", Object.keys(lpSchema));
  
  const pcSchema = data.definitions.profile_customers.properties;
  console.log("Profile Customers columns:", Object.keys(pcSchema));
}
run();
