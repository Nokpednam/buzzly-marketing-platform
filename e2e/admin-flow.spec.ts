import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Flow', () => {
    test('should navigate to admin login', async ({ page }) => {
        await page.goto('/admin/login');

        // Check for admin login form
        await expect(page.getByLabel(/email/i)).toBeVisible();
    });

    test('should protect admin routes', async ({ page }) => {
        await page.goto('/admin/monitor');

        // Should redirect to admin login if not authenticated
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should navigate to admin dashboard routes', async ({ page }) => {
        // Try accessing different admin routes
        const adminRoutes = [
            '/admin/monitor',
            '/admin/audit-logs',
            '/admin/workspaces',
            '/admin/members',
            '/admin/support',
            '/admin/tier-management',
        ];

        for (const route of adminRoutes) {
            await page.goto(route);
            // Should redirect to login for all protected routes
            await expect(page).toHaveURL(/\/admin\/login/);
        }
    });
});

test.describe('Admin Monitor Dashboard', () => {
    test('should display monitor dashboard elements', async ({ page }) => {
        await page.goto('/admin/monitor');

        // If redirected to login, that's expected
        const currentUrl = page.url();
        if (currentUrl.includes('/admin/monitor')) {
            // If we're on the monitor page, check for dashboard elements
            await expect(page.getByRole('main')).toBeVisible();
        } else {
            // Should be on login page
            await expect(page).toHaveURL(/\/admin\/login/);
        }
    });
});

test.describe('Admin Workspace Management', () => {
    test('should navigate to workspaces page', async ({ page }) => {
        await page.goto('/admin/workspaces');

        // Should redirect to login if not authenticated
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should navigate to members page', async ({ page }) => {
        await page.goto('/admin/members');

        // Should redirect to login if not authenticated
        await expect(page).toHaveURL(/\/admin\/login/);
    });
});

test.describe('Admin Support and Audit', () => {
    test('should navigate to support page', async ({ page }) => {
        await page.goto('/admin/support');

        // Should redirect to login if not authenticated
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should navigate to audit logs', async ({ page }) => {
        await page.goto('/admin/audit-logs');

        // Should redirect to login if not authenticated
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should navigate to tier management', async ({ page }) => {
        await page.goto('/admin/tier-management');

        // Should redirect to login if not authenticated
        await expect(page).toHaveURL(/\/admin\/login/);
    });
});
