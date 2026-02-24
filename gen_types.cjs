const { execSync } = require('child_process');
const fs = require('fs');

try {
    console.log("Generating types...");
    const output = execSync('npx.cmd supabase gen types typescript --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres"', { encoding: 'utf-8' });
    // find where "export type Json =" starts
    const startIndex = output.indexOf('export type Json =');
    if (startIndex === -1) {
        console.error("Failed to find types start. Full output:\\n", output);
        process.exit(1);
    }
    const cleanOutput = output.substring(startIndex);
    fs.writeFileSync('src/integrations/supabase/types.ts', cleanOutput);
    console.log("Types written successfully.");
} catch (e) {
    console.error("Error generating types:", e);
}
