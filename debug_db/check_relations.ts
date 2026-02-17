
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRelations() {
    console.log("--- Checking Data Relations ---");

    // 1. Check Profiles
    const { data: profiles, error: pError } = await supabase.from('profile_customers').select('id, user_id, first_name').limit(5);
    if (pError) console.error("Profiles Error:", pError.message);
    else console.log("Profiles Found:", profiles?.length);

    // 2. Check Workspaces
    const { data: workspaces, error: wError } = await supabase.from('workspaces').select('id, workspace_name').limit(5);
    if (wError) console.error("Workspaces Error:", wError.message);
    else console.log("Workspaces Found:", workspaces?.length);

    // 3. Check Workspace Members (Link between User and Workspace)
    const { data: members, error: mError } = await supabase.from('workspace_members').select('user_id, workspace_id').limit(5);
    if (mError) console.error("Members Error:", mError.message);
    else console.log("Workspace Members Found:", members?.length);

    // 4. Check Feedback current state
    const { data: feedback, error: fError } = await supabase.from('feedback').select('id, user_id, customer_activities_id').limit(5);
    if (fError) console.error("Feedback Error:", fError.message);
    else console.log("Feedback Sample:", JSON.stringify(feedback, null, 2));
}

checkRelations();
