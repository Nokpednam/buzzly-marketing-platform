/**
 * Vercel serverless entry: routes all traffic to the Express app in server.ts.
 * Requires mock-api/vercel.json rewrites and env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
import app from "../server";

export default app;
