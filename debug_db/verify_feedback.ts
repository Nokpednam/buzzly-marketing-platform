
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.error("Missing environment variables. Please check .env file.");
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function verifyFeedbackData() {
    console.log("--- Verifying Feedback Data ---");

    // 1. Check total count using Service Role (Bypasses RLS)
    const { count: totalCount, error: countError } = await supabaseAdmin
        .from("feedback")
        .select("*", { count: "exact", head: true });

    if (countError) {
        console.error("Error fetching total count (Service Role):", countError.message);
    } else {
        console.log(`Total Feedback Records (Service Role): ${totalCount}`);
    }

    // 2. Check data visibility using Anon Key (Simulates Public/Unauthenticated access, though app uses Authenticated)
    // We can't easily simulate Authenticated user without a token, but this checks if it's PUBLICLY visible at least.
    // Ideally we need to sign in a user.

    // Let's try to sign in as a test user if possible, or just check public access.
    // Actually, let's just check if we can read ANY data with Service Role to confirm data exists.

    const { data: feedbackData, error: readError } = await supabaseAdmin
        .from("feedback")
        .select(`
      id,
      comment,
      rating:rating_id (score)
    `)
        .limit(5);

    if (readError) {
        console.error("Error reading feedback samples:", readError.message);
    } else {
        console.log("Sample Data (Service Role):");
        console.log(JSON.stringify(feedbackData, null, 2));
    }

    // 3. Verify Rating Table
    const { count: ratingCount, error: ratingError } = await supabaseAdmin
        .from("rating")
        .select("*", { count: "exact", head: true });

    if (ratingError) {
        console.error("Error fetching rating count:", ratingError.message);
    } else {
        console.log(`Total Rating Records: ${ratingCount}`);
    }
}

verifyFeedbackData();
