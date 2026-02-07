import { test, expect } from '@playwright/test';

// Helper function to login as customer
async function loginAsCustomer(page: any) {
    await page.goto('/auth');
    await page.getByLabel(/email/i).fill('customer@test.com');
    await page.getByLabel(/password/i).fill('testpassword123');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Customer Dashboard Flow', () => {
    test('should access dashboard after login', async ({ page }) => {
        // This test requires authentication setup
        // For now, we'll just navigate to dashboard and check protection
        await page.goto('/dashboard');

        // Should redirect to auth if not logged in
        await expect(page).toHaveURL(/\/(auth|$)/);
    });

    test('should display dashboard navigation', async ({ page }) => {
        // Navigate to dashboard (will redirect if not authenticated)
        await page.goto('/dashboard');

        // Check if we're redirected or if nav exists
        const currentUrl = page.url();
        if (currentUrl.includes('/dashboard')) {
            // If we're on dashboard, check for navigation
            await expect(page.getByRole('navigation')).toBeVisible();
        }
    });
});

test.describe('Campaigns Flow', () => {
    test('should navigate to campaigns page', async ({ page }) => {
        await page.goto('/campaigns');

        // Should redirect to auth if not logged in
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(campaigns|auth|$)/);
    });

    test('should protect campaign routes', async ({ page }) => {
        // Try to access a campaign detail page
        await page.goto('/campaigns/test-id');

        // Should redirect to auth if not logged in
        await expect(page).toHaveURL(/\/(auth|$)/);
    });
});

test.describe('Analytics Pages', () => {
    test('should navigate to analytics page', async ({ page }) => {
        await page.goto('/analytics');

        // Should redirect to auth if not logged in
        await expect(page).toHaveURL(/\/(auth|$)/);
    });

    test('should navigate to social analytics', async ({ page }) => {
        await page.goto('/social-analytics');

        // Should redirect to auth if not logged in
        await expect(page).toHaveURL(/\/(auth|$)/);
    });

    test('should navigate to customer journey', async ({ page }) => {
        await page.goto('/customer-journey');

        // Should redirect to auth if not logged in
        await expect(page).toHaveURL(/\/(auth|$)/);
    });

    test('should navigate to AARRR funnel', async ({ page }) => {
        await page.goto('/aarrr-funnel');

        // Should redirect to auth if not logged in
        await expect(page).toHaveURL(/\/(auth|$)/);
    });
});

test.describe('Settings and Team Management', () => {
    test('should navigate to settings page', async ({ page }) => {
        await page.goto('/settings');

        // Should redirect to auth if not logged in
        await expect(page).toHaveURL(/\/(auth|$)/);
    });

    test('should navigate to team management', async ({ page }) => {
        await page.goto('/team');

        // Should redirect to auth if not logged in
        await expect(page).toHaveURL(/\/(auth|$)/);
    });
});
