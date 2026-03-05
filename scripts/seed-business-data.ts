#!/usr/bin/env node
/**
 * seed-business-data.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs fix_payment_transactions_sync.sql against the remote Supabase Postgres
 * database to seed realistic payment transaction data for Revenue Trends.
 *
 * Usage:  npm run seed
 *
 * Required env vars (in .env.local):
 *   SUPABASE_DB_PASSWORD   – database password (from Supabase dashboard → Settings → Database)
 *   VITE_SUPABASE_URL      – your Supabase project URL  (already in project)
 *
 * Or set the full connection string:
 *   DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
 */

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from 'pg';
const { Client } = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── 1. Resolve connection string ──────────────────────────────────────────────
function getConnectionString(): string {
    // Option A: explicit DATABASE_URL
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

    // Option B: reconstruct from VITE_SUPABASE_URL + SUPABASE_DB_PASSWORD
    const url = process.env.VITE_SUPABASE_URL;
    const pass = process.env.SUPABASE_DB_PASSWORD;

    if (url && pass) {
        // Extract project ref: https://xpmswnktazcjpqumrfsh.supabase.co → xpmswnktazcjpqumrfsh
        const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
        if (match) {
            const ref = match[1];
            return `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
        }
    }

    throw new Error(
        '\n❌  Cannot connect — missing env vars.\n\n' +
        '   Add ONE of these to .env.local:\n\n' +
        '   Option A (recommended):\n' +
        '     DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres\n\n' +
        '   Option B:\n' +
        '     SUPABASE_DB_PASSWORD=your_db_password\n' +
        '     (VITE_SUPABASE_URL is already set in your project)\n\n' +
        '   Get the password from: Supabase Dashboard → Settings → Database → Database password\n'
    );
}

// ── 2. Load SQL file ──────────────────────────────────────────────────────────
const SQL_FILE = resolve(__dirname, '../supabase/snippets/fix_payment_transactions_sync.sql');

// Strip the final verification SELECT (we capture RAISE NOTICE output instead)
// The file may have an optional trailing SELECT for manual verification — we keep it.
const sql = readFileSync(SQL_FILE, 'utf-8');

// ── 3. Run ────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n🌱  Buzzly Business Data Seeder');
    console.log('   SQL:', SQL_FILE);

    const connectionString = getConnectionString();
    const projectRef = connectionString.match(/postgres\.([^:]+)/)?.[1] ?? 'unknown';
    console.log(`   Target: ${projectRef}\n`);

    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();
        console.log('✅  Connected to database');

        // Capture RAISE NOTICE messages
        client.on('notice', (msg: { message?: string }) => {
            if (msg.message) {
                console.log('   📋', msg.message);
            }
        });

        console.log('\n⏳  Running seed SQL (may take 10–30 sec)…\n');
        await client.query(sql);

        // Show verification result
        const result = await client.query(`
      SELECT
        to_char(date_trunc('month', created_at), 'Mon YYYY') AS month,
        COUNT(*)::int                                          AS tx_count,
        ROUND(SUM(amount))::int                               AS total_mrr_thb
      FROM public.payment_transactions
      WHERE status = 'completed'
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at);
    `);

        if (result.rows.length === 0) {
            console.warn('\n⚠️   No transactions found after seeding. Check the SQL output above for errors.');
        } else {
            console.log('\n📊  Verification — Monthly MRR after seeding:');
            console.log('   ─────────────────────────────────────────');
            let total = 0;
            for (const row of result.rows) {
                const bar = '█'.repeat(Math.round((row.total_mrr_thb / 500000) * 20));
                console.log(`   ${row.month.padEnd(10)} ${String(row.tx_count).padStart(4)} txs   ฿${String(row.total_mrr_thb.toLocaleString()).padStart(9)}  ${bar}`);
                total += row.total_mrr_thb;
            }
            console.log('   ─────────────────────────────────────────');
            console.log(`   TOTAL                        ฿${total.toLocaleString()}`);
            console.log(`\n✅  Seed complete! ${result.rows.length} months of data.`);
            console.log('   Refresh the app → Revenue Trends will show 12 months now.\n');
        }
    } finally {
        await client.end();
    }
}

main().catch((err) => {
    console.error('\n❌  Seed failed:', err.message || err);
    process.exit(1);
});
