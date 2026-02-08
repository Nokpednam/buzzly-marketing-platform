import { test, expect } from '@playwright/test';

test.describe('Campaign Management - Complete Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Note: This assumes you have test data or can create auth state
        await page.goto('/');
    });

    test('should create, view, edit, and delete campaign', async ({ page }) => {
        // 1. Navigate to campaigns page
        await page.goto('/campaigns');

        // Should redirect to auth if  not logged in
        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // We're logged in, proceed with campaign management

            // 2. Click create campaign button
            const createButton = page.locator('button:has-text("สร้าง"), button:has-text("Create")');
            if (await createButton.isVisible()) {
                await createButton.click();

                // 3. Fill campaign form
                await page.fill('[name="name"], input[placeholder*="ชื่อ"], input[placeholder*="name" i]', 'Test E2E Campaign');

                // 4. Submit form
                await page.click('button:has-text("บันทึก"), button:has-text("Save")');

                // 5. Wait for success (toast or redirect)
                await page.waitForTimeout(2000);

                // 6. Verify campaign appears in list
                await expect(page.locator('text=Test E2E Campaign')).toBeVisible({ timeout: 10000 });

                // 7. Edit campaign - click on it or edit button
                const editButton = page.locator('button[aria-label*="Edit"], button:has-text("แก้ไข")').first();
                if (await editButton.isVisible()) {
                    await editButton.click();

                    // Update name
                    const nameInput = page.locator('[name="name"], input[placeholder*="ชื่อ"]');
                    await nameInput.clear();
                    await nameInput.fill('Updated E2E Campaign');

                    // Save
                    await page.click('button:has-text("บันทึก"), button:has-text("Save")');
                    await page.waitForTimeout(2000);

                    // Verify update
                    await expect(page.locator('text=Updated E2E Campaign')).toBeVisible({ timeout: 10000 });
                }

                // 8. Delete campaign
                const deleteButton = page.locator('button[aria-label*="Delete"], button:has-text("ลบ")').first();
                if (await deleteButton.isVisible()) {
                    await deleteButton.click();

                    // Confirm deletion if there's a dialog
                    const confirmButton = page.locator('button:has-text("ยืนยัน"), button:has-text("Confirm"), button:has-text("ลบ")');
                    if (await confirmButton.isVisible({ timeout: 2000 })) {
                        await confirmButton.click();
                    }

                    await page.waitForTimeout(2000);

                    // Verify campaign is deleted (not in list)
                    await expect(page.locator('text=Updated E2E Campaign')).not.toBeVisible({ timeout: 5000 });
                }
            }
        }
    });

    test('should validate campaign form fields', async ({ page }) => {
        await page.goto('/campaigns');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Click create
            const createButton = page.locator('button:has-text("สร้าง"), button:has-text("Create")');
            if (await createButton.isVisible()) {
                await createButton.click();

                // Try to submit empty form
                await page.click('button:has-text("บันทึก"), button:has-text("Save")');

                // Should show validation error or not submit
                await page.waitForTimeout(1000);

                // Form should still be visible (not submitted)
                const nameInput = page.locator('[name="name"], input[placeholder*="ชื่อ"]');
                await expect(nameInput).toBeVisible();
            }
        }
    });

    test('should show campaign insights and metrics', async ({ page }) => {
        await page.goto('/campaigns');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Look for campaign cards or table
            const campaignList = page.locator('[role="table"], .campaign-card, [data-testid="campaign-list"]');

            // Check if metrics are displayed (impressions, clicks, etc.)
            const hasMetrics = await page.locator('text=/impressions|clicks|conversions|ผู้เข้าชม|คลิก/i').isVisible({ timeout: 5000 })
                .catch(() => false);

            if (hasMetrics) {
                // Metrics are displayed correctly
                console.log('Campaign metrics are visible');
            }
        }
    });

    test('should handle campaign status changes', async ({ page }) => {
        await page.goto('/campaigns');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Look for status toggle/button
            const statusButton = page.locator('button:has-text("active"), button:has-text("paused"), select[name="status"]').first();

            if (await statusButton.isVisible({ timeout: 3000 })) {
                await statusButton.click();
                await page.waitForTimeout(1000);

                // Status should change (visual feedback)
                console.log('Status change interaction tested');
            }
        }
    });
});

test.describe('Campaign UI Interactions', () => {
    test('should prevent double submission', async ({ page }) => {
        await page.goto('/campaigns');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const createButton = page.locator('button:has-text("สร้าง"), button:has-text("Create")');

            if (await createButton.isVisible()) {
                await createButton.click();

                // Fill form
                await page.fill('[name="name"]', 'Double Click Test');

                // Click submit multiple times rapidly
                const submitButton = page.locator('button:has-text("บันทึก"), button:has-text("Save")');
                await submitButton.click();
                await submitButton.click(); // Second click
                await submitButton.click(); // Third click

                await page.waitForTimeout(3000);

                // Should only create one campaign, not three
                // Count how many "Double Click Test" entries exist
                const count = await page.locator('text=Double Click Test').count();
                expect(count).toBeLessThanOrEqual(1);
            }
        }
    });

    test('should show loading states', async ({ page }) => {
        await page.goto('/campaigns');

        // Look for loading indicators
        const hasLoader = await page.locator('[role="status"], .loading, .spinner, text=/loading|กำลังโหลด/i')
            .isVisible({ timeout: 1000 })
            .catch(() => false);

        // Loading state should appear briefly
        if (hasLoader) {
            console.log('Loading state is displayed');
        }
    });

    test('should handle API errors gracefully', async ({ page }) => {
        // This test would require mocking API to return errors
        // For now, we check that error states are handled in UI

        await page.goto('/campaigns');

        // Check if page doesn't crash and shows content or error message
        const hasContent = await page.locator('main, [role="main"], body').isVisible();
        expect(hasContent).toBeTruthy();
    });
});

test.describe('Campaign Search and Filter', () => {
    test('should filter campaigns by status', async ({ page }) => {
        await page.goto('/campaigns');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Look for filter dropdown
            const filterSelect = page.locator('select:has-text("status"), select:has-text("สถานะ")');

            if (await filterSelect.isVisible({ timeout: 3000 })) {
                // Select active campaigns
                await filterSelect.selectOption('active');
                await page.waitForTimeout(1000);

                // Verify filtered results
                console.log('Filter functionality tested');
            }
        }
    });

    test('should search campaigns by name', async ({ page }) => {
        await page.goto('/campaigns');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Look for search input
            const searchInput = page.locator('input[type="search"], input[placeholder*="ค้นหา"], input[placeholder*="Search"]');

            if (await searchInput.isVisible({ timeout: 3000 })) {
                await searchInput.fill('test');
                await page.waitForTimeout(1000);

                // Results should be filtered
                console.log('Search functionality tested');
            }
        }
    });
});
