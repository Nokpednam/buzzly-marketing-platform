import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

const OWNER_EMAIL = `owner-e2e-${Date.now()}@test.com`;
const OWNER_PASSWORD = 'password123';

test.describe('Owner Dashboard Flow', () => {

    test.beforeAll(async ({ request }) => {
        // 1. Sign up a new user via API
        // Supabase is on port 54321 locally
        const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
        const response = await request.post(`${supabaseUrl}/auth/v1/signup`, {
            headers: {
                'apikey': process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
                'Content-Type': 'application/json',
            },
            data: {
                email: OWNER_EMAIL,
                password: OWNER_PASSWORD,
                data: {
                    first_name: 'Test',
                    last_name: 'Owner',
                    is_employee_signup: true, // Trigger handle_new_user to create employee record
                }
            }
        });

        if (!response.ok()) {
            console.error('Signup failed:', response.status(), await response.text());
        }
        expect(response.ok()).toBeTruthy();

        // 2. Elevate user to 'owner' role via SQL
        try {
            const sql = `
                DO $$
                DECLARE
                    v_user_id uuid;
                    v_role_id uuid;
                BEGIN
                    -- Get User ID
                    SELECT id INTO v_user_id FROM auth.users WHERE email = '${OWNER_EMAIL}';
                    
                    -- Get Owner Role ID
                    SELECT id INTO v_role_id FROM public.role_employees WHERE role_name ILIKE 'owner';
                    
                    -- Manual Insert/Update into employees to avoid trigger race conditions
                    INSERT INTO public.employees (user_id, email, status, approval_status, role_employees_id)
                    VALUES (v_user_id, '${OWNER_EMAIL}', 'active', 'approved', v_role_id)
                    ON CONFLICT (user_id) DO UPDATE SET
                    role_employees_id = v_role_id, status = 'active', approval_status = 'approved';

                    RAISE NOTICE 'Elevated user % with role %', v_user_id, v_role_id;
                END $$;
            `;

            const output = execSync(`PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres`, { input: sql });
            console.log(`Elevation output: ${output.toString()}`);
            console.log(`Elevated ${OWNER_EMAIL} to owner role.`);
        } catch (error) {
            console.error('Failed to elevate user role:', error);
            throw error;
        }
    });

    test('should allow owner to access dashboard pages', async ({ page }) => {
        // 3. Login via UI
        await page.goto('/admin/login');
        await page.getByLabel(/email/i).fill(OWNER_EMAIL);
        await page.getByLabel(/password/i).fill(OWNER_PASSWORD);
        await page.getByRole('button', { name: /เข้าสู่ระบบ|sign in|login/i }).click();

        // 4. Verify Redirect to Dashboard
        // Give it some time to process the login and redirect
        await expect(page).toHaveURL(/\/(owner|admin\/monitor)/, { timeout: 10000 });

        await page.goto('/owner/business-performance');
        await expect(page).toHaveURL(/\/owner\/business-performance/);
        await expect(page.getByRole('heading', { name: /Business Performance/i })).toBeVisible({ timeout: 15000 });

        // 5. Navigate Sidebar
        await page.getByRole('link', { name: /Product Usage/i }).click();
        await expect(page).toHaveURL(/\/owner\/product-usage/);
        await expect(page.getByRole('heading', { name: /Product Usage/i })).toBeVisible({ timeout: 15000 });

        // 6. Navigate other pages
        await page.goto('/owner/user-feedback');
        await expect(page.getByRole('heading', { name: /User Feedback/i })).toBeVisible({ timeout: 15000 });

        await page.goto('/owner/executive-report');
        await expect(page.getByRole('heading', { name: /Executive Report/i })).toBeVisible({ timeout: 15000 });

        await page.goto('/owner/customer-tiers');
        await expect(page.getByRole('heading', { name: /Customer Tiers/i })).toBeVisible({ timeout: 15000 });
    });

    test('should protect owner routes from unauthenticated access', async ({ page }) => {
        // Ensure we are logged out
        // Use a new context or incognito would be better, but generic test here runs in isolated context per test file usually?
        // Actually specific test runs in isolation? Playwright defaults to new context per test.
        // So this test starts fresh (unauthenticated).

        const ownerRoutes = [
            '/owner/product-usage',
            '/owner/business-performance',
            '/owner/user-feedback',
            '/owner/executive-report',
            '/owner/customer-tiers',
        ];

        for (const route of ownerRoutes) {
            await page.goto(route);
            // Should redirect to admin login (owner is an employee role)
            await expect(page).toHaveURL(/\/admin\/login/);
        }
    });
});
