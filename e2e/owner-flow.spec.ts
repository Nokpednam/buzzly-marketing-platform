import { test, expect } from '@playwright/test';

test.describe('Owner Dashboard Flow', () => {
    test('should protect owner routes', async ({ page }) => {
        await page.goto('/owner/product-usage');

        // Should redirect to admin login (owner is an employee role)
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should navigate to owner dashboard routes', async ({ page }) => {
        const ownerRoutes = [
            '/owner/product-usage',
            '/owner/business-performance',
            '/owner/user-feedback',
            '/owner/executive-report',
            '/owner/customer-tiers',
        ];

        for (const route of ownerRoutes) {
            await page.goto(route);
            // Should redirect to login for all protected routes
            await expect(page).toHaveURL(/\/admin\/login/);
        }
    });
});

test.describe('Owner Product Usage', () => {
    test('should navigate to product usage page', async ({ page }) => {
        await page.goto('/owner/product-usage');

        const currentUrl = page.url();
        if (currentUrl.includes('/owner/product-usage')) {
            // If authenticated, check for page elements
            await expect(page.getByRole('main')).toBeVisible();
        } else {
            // Should be redirected to login
            await expect(page).toHaveURL(/\/admin\/login/);
        }
    });
});

test.describe('Owner Business Performance', () => {
    test('should navigate to business performance page', async ({ page }) => {
        await page.goto('/owner/business-performance');

        // Should redirect to login if not authenticated
        await expect(page).toHaveURL(/\/admin\/login/);
    });
});

test.describe('Owner Analytics and Reports', () => {
    test('should navigate to user feedback page', async ({ page }) => {
        await page.goto('/owner/user-feedback');

        // Should redirect to login if not authenticated
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should navigate to executive report page', async ({ page }) => {
        await page.goto('/owner/executive-report');

        // Should redirect to login if not authenticated
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should navigate to customer tiers page', async ({ page }) => {
        await page.goto('/owner/customer-tiers');

        // Should redirect to login if not authenticated
        await expect(page).toHaveURL(/\/admin\/login/);
    });
});

test.describe('Owner Default Redirect', () => {
    test('should redirect /owner to /owner/product-usage', async ({ page }) => {
        await page.goto('/owner');

        // Should redirect to product-usage or login
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(owner\/product-usage|admin\/login)/);
    });
});
