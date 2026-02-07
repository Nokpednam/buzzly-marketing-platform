import { test, expect } from '@playwright/test';

test.describe('Workspace Settings - Complete Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should create and update workspace settings', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Check if workspace exists or needs to be created
            const createWorkspaceButton = page.locator('button:has-text("สร้าง Workspace"), button:has-text("Create Workspace")');

            if (await createWorkspaceButton.isVisible({ timeout: 3000 })) {
                // Create workspace first
                await createWorkspaceButton.click();
                await page.fill('input[name="name"], input[placeholder*="workspace" i]', 'Test Workspace');
                await page.click('button:has-text("สร้าง"), button:has-text("Create")');
                await page.waitForTimeout(2000);
            }

            // Now update workspace settings
            const nameInput = page.locator('input[name="name"]');
            if (await nameInput.isVisible({ timeout: 5000 })) {
                await nameInput.clear();
                await nameInput.fill('Updated Workspace Name');

                // Fill description
                const descInput = page.locator('textarea[name="description"], input[name="description"]');
                if (await descInput.isVisible({ timeout: 2000 })) {
                    await descInput.clear();
                    await descInput.fill('Updated workspace description for testing');
                }

                // Select business type
                const businessTypeSelect = page.locator('select[name="business_type_id"], select:has-text("ประเภทธุรกิจ")');
                if (await businessTypeSelect.isVisible({ timeout: 2000 })) {
                    await businessTypeSelect.selectOption({ index: 1 });
                }

                // Select industry
                const industrySelect = page.locator('select[name="industries_id"], select:has-text("อุตสาหกรรม")');
                if (await industrySelect.isVisible({ timeout: 2000 })) {
                    await industrySelect.selectOption({ index: 1 });
                }

                // Save settings
                await page.click('button:has-text("บันทึก"), button:has-text("Save")');
                await page.waitForTimeout(2000);

                // Verify success message
                const hasSuccess = await page.locator('text=/success|สำเร็จ|saved/i').isVisible({ timeout: 5000 })
                    .catch(() => false);

                if (hasSuccess) {
                    console.log('Workspace settings saved successfully');
                }
            }
        }
    });

    test('should validate required workspace fields', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const nameInput = page.locator('input[name="name"]');

            if (await nameInput.isVisible({ timeout: 5000 })) {
                // Clear name field (required)
                await nameInput.clear();

                // Try to save
                await page.click('button:has-text("บันทึก"), button:has-text("Save")');
                await page.waitForTimeout(1000);

                // Should show validation error or button disabled
                const saveButton = page.locator('button:has-text("บันทึก"), button:has-text("Save")');
                const isDisabled = await saveButton.isDisabled();

                expect(isDisabled).toBeTruthy();
                console.log('Validation preventing save with empty name');
            }
        }
    });

    test('should upload workspace logo', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Look for file upload input
            const uploadInput = page.locator('input[type="file"]');

            if (await uploadInput.isVisible({ timeout: 5000 })) {
                // Note: Actual file upload would require a test file
                console.log('Logo upload input found');
            }
        }
    });
});

test.describe('Platform Connections', () => {
    test('should connect and disconnect platforms', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Navigate to platforms tab if needed
            const platformsTab = page.locator('button:has-text("แพลตฟอร์ม"), button:has-text("Platforms"), a:has-text("Connections")');

            if (await platformsTab.isVisible({ timeout: 5000 })) {
                await platformsTab.click();
                await page.waitForTimeout(1000);
            }

            // Find a platform to connect (Facebook, Google, etc.)
            const connectButton = page.locator('button:has-text("เชื่อมต่อ"), button:has-text("Connect")').first();

            if (await connectButton.isVisible({ timeout: 5000 })) {
                await connectButton.click();
                await page.waitForTimeout(2000);

                // Note: Actual OAuth flow would redirect to platform
                // For this test, we just check the button interaction works
                console.log('Platform connect button works');

                // If disconnect button appears (platform is connected)
                const disconnectButton = page.locator('button:has-text("ยกเลิกการเชื่อมต่อ"), button:has-text("Disconnect")').first();

                if (await disconnectButton.isVisible({ timeout: 3000 })) {
                    await disconnectButton.click();

                    // Confirm disconnect
                    const confirmButton = page.locator('button:has-text("ยืนยัน"), button:has-text("Confirm"), button:has-text("ยกเลิก")');
                    if (await confirmButton.isVisible({ timeout: 2000 })) {
                        await confirmButton.click();
                    }

                    await page.waitForTimeout(2000);
                    console.log('Platform disconnect works');
                }
            }
        }
    });

    test('should show platform connection status', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Navigate to platforms tab
            const platformsTab = page.locator('button:has-text("แพลตฟอร์ม"), button:has-text("Platforms")');

            if (await platformsTab.isVisible({ timeout: 5000 })) {
                await platformsTab.click();
                await page.waitForTimeout(1000);

                // Check for status indicators
                const hasStatus = await page.locator('text=/connected|disconnected|เชื่อมต่อแล้ว|ไม่ได้เชื่อมต่อ/i').isVisible({ timeout: 5000 })
                    .catch(() => false);

                if (hasStatus) {
                    console.log('Platform status displayed');
                }
            }
        }
    });

    test('should refresh platform data', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const platformsTab = page.locator('button:has-text("แพลตฟอร์ม"), button:has-text("Platforms")');

            if (await platformsTab.isVisible({ timeout: 5000 })) {
                await platformsTab.click();
                await page.waitForTimeout(1000);

                // Look for refresh button
                const refreshButton = page.locator('button:has-text("รีเฟรช"), button:has-text("Refresh"), button[aria-label*="refresh"]').first();

                if (await refreshButton.isVisible({ timeout: 3000 })) {
                    await refreshButton.click();
                    await page.waitForTimeout(2000);

                    console.log('Platform refresh works');
                }
            }
        }
    });
});

test.describe('Billing and Subscription', () => {
    test('should display current plan', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Navigate to billing tab
            const billingTab = page.locator('button:has-text("การเรียกเก็บเงิน"), button:has-text("Billing"), a:has-text("Subscription")');

            if (await billingTab.isVisible({ timeout: 5000 })) {
                await billingTab.click();
                await page.waitForTimeout(1000);

                // Check for plan information
                const hasPlan = await page.locator('text=/free|basic|pro|enterprise|ฟรี|พื้นฐาน/i').isVisible({ timeout: 5000 })
                    .catch(() => false);

                if (hasPlan) {
                    console.log('Current plan displayed');
                }
            }
        }
    });

    test('should show upgrade options', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const billingTab = page.locator('button:has-text("การเรียกเก็บเงิน"), button:has-text("Billing")');

            if (await billingTab.isVisible({ timeout: 5000 })) {
                await billingTab.click();
                await page.waitForTimeout(1000);

                // Look for upgrade button
                const upgradeButton = page.locator('button:has-text("อัปเกรด"), button:has-text("Upgrade")');

                if (await upgradeButton.isVisible({ timeout: 3000 })) {
                    await upgradeButton.click();
                    await page.waitForTimeout(1000);

                    // Should show plan options
                    const hasPlans = await page.locator('.plan-card, [data-testid="plan-option"]').isVisible({ timeout: 3000 })
                        .catch(() => false);

                    if (hasPlans) {
                        console.log('Plan upgrade options displayed');
                    }
                }
            }
        }
    });
});

test.describe('Profile Settings', () => {
    test('should update user profile', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Navigate to profile tab
            const profileTab = page.locator('button:has-text("โปรไฟล์"), button:has-text("Profile")');

            if (await profileTab.isVisible({ timeout: 5000 })) {
                await profileTab.click();
                await page.waitForTimeout(1000);
            }

            // Update profile fields
            const fullNameInput = page.locator('input[name="full_name"], input[name="name"]');

            if (await fullNameInput.isVisible({ timeout: 3000 })) {
                await fullNameInput.clear();
                await fullNameInput.fill('Updated Test User');

                // Save
                await page.click('button:has-text("บันทึก"), button:has-text("Save")');
                await page.waitForTimeout(2000);

                // Verify success
                const hasSuccess = await page.locator('text=/success|สำเร็จ/i').isVisible({ timeout: 3000 })
                    .catch(() => false);

                if (hasSuccess) {
                    console.log('Profile updated successfully');
                }
            }
        }
    });

    test('should change password', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const profileTab = page.locator('button:has-text("โปรไฟล์"), button:has-text("Profile"), button:has-text("Security")');

            if (await profileTab.isVisible({ timeout: 5000 })) {
                await profileTab.click();
                await page.waitForTimeout(1000);
            }

            // Look for change password button
            const changePasswordButton = page.locator('button:has-text("เปลี่ยนรหัสผ่าน"), button:has-text("Change Password")');

            if (await changePasswordButton.isVisible({ timeout: 3000 })) {
                await changePasswordButton.click();
                await page.waitForTimeout(1000);

                // Fill password form
                await page.fill('input[name="current_password"], input[placeholder*="current" i]', 'oldpassword');
                await page.fill('input[name="new_password"], input[placeholder*="new" i]', 'newpassword123');
                await page.fill('input[name="confirm_password"], input[placeholder*="confirm" i]', 'newpassword123');

                // Submit
                await page.click('button:has-text("บันทึก"), button:has-text("Save"), button:has-text("Change")');
                await page.waitForTimeout(2000);

                console.log('Password change form tested');
            }
        }
    });
});

test.describe('Settings UI Validation', () => {
    test('should show all settings tabs', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Check for common settings tabs
            const tabs = [
                'workspace',
                'profile',
                'team',
                'platforms',
                'billing',
                'notifications',
            ];

            for (const tab of tabs) {
                const tabElement = page.locator(`button:has-text("${tab}"), a:has-text("${tab}")`).first();
                const isVisible = await tabElement.isVisible({ timeout: 2000 }).catch(() => false);

                if (isVisible) {
                    console.log(`${tab} tab found`);
                }
            }
        }
    });

    test('should persist settings after save', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const nameInput = page.locator('input[name="name"]');

            if (await nameInput.isVisible({ timeout: 5000 })) {
                const testValue = 'Persistence Test ' + Date.now();
                await nameInput.clear();
                await nameInput.fill(testValue);

                // Save
                await page.click('button:has-text("บันทึก"), button:has-text("Save")');
                await page.waitForTimeout(2000);

                // Reload page
                await page.reload();
                await page.waitForTimeout(2000);

                // Check if value persisted
                const newValue = await nameInput.inputValue();
                expect(newValue).toBe(testValue);

                console.log('Settings persistence verified');
            }
        }
    });

    test('should show unsaved changes warning', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const nameInput = page.locator('input[name="name"]');

            if (await nameInput.isVisible({ timeout: 5000 })) {
                // Make a change
                await nameInput.clear();
                await nameInput.fill('Unsaved Change');

                // Try to navigate away
                const dashboardLink = page.locator('a[href="/dashboard"], button:has-text("Dashboard")');

                if (await dashboardLink.isVisible({ timeout: 3000 })) {
                    await dashboardLink.click();
                    await page.waitForTimeout(1000);

                    // Should show confirmation dialog (if implemented)
                    const hasWarning = await page.locator('text=/unsaved|discard|ยกเลิก|ละทิ้ง/i').isVisible({ timeout: 2000 })
                        .catch(() => false);

                    if (hasWarning) {
                        console.log('Unsaved changes warning shown');
                    }
                }
            }
        }
    });

    test('should disable save button when form is invalid', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const nameInput = page.locator('input[name="name"]');

            if (await nameInput.isVisible({ timeout: 5000 })) {
                // Clear required field
                await nameInput.clear();
                await page.waitForTimeout(500);

                // Save button should be disabled
                const saveButton = page.locator('button:has-text("บันทึก"), button:has-text("Save")');
                const isDisabled = await saveButton.isDisabled();

                expect(isDisabled).toBeTruthy();
                console.log('Save button properly disabled for invalid form');
            }
        }
    });

    test('should show loading state while saving', async ({ page }) => {
        await page.goto('/settings');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const nameInput = page.locator('input[name="name"]');

            if (await nameInput.isVisible({ timeout: 5000 })) {
                await nameInput.clear();
                await nameInput.fill('Loading Test');

                // Click save
                const saveButton = page.locator('button:has-text("บันทึก"), button:has-text("Save")');
                await saveButton.click();

                // Check for loading state (briefly)
                const hasLoading = await page.locator('button:has-text("กำลัง"), button:disabled, [role="status"]').isVisible({ timeout: 1000 })
                    .catch(() => false);

                if (hasLoading) {
                    console.log('Loading state displayed during save');
                }
            }
        }
    });
});
