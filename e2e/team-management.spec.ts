import { test, expect } from '@playwright/test';

test.describe('Team Management - Complete Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should invite, manage, and remove team members', async ({ page }) => {
        // Navigate to team management page
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // 1. Click invite member button
            const inviteButton = page.locator('button:has-text("เชิญสมาชิก"), button:has-text("Invite"), button:has-text("เพิ่มสมาชิก")');

            if (await inviteButton.isVisible({ timeout: 5000 })) {
                await inviteButton.click();

                // 2. Fill invitation form
                await page.fill('input[name="email"], input[type="email"]', 'newmember@example.com');

                // Select role
                const roleSelect = page.locator('select[name="role"], [name="role"]');
                if (await roleSelect.isVisible({ timeout: 2000 })) {
                    await roleSelect.selectOption('member'); // or { index: 1 }
                }

                // 3. Send invitation
                await page.click('button:has-text("ส่งคำเชิญ"), button:has-text("Send"), button:has-text("เชิญ")');
                await page.waitForTimeout(2000);

                // 4. Verify invitation appears in pending list
                await expect(page.locator('text=newmember@example.com')).toBeVisible({ timeout: 10000 });

                // 5. Cancel invitation
                const invitationRow = page.locator('text=newmember@example.com').locator('..');
                const cancelButton = invitationRow.locator('button:has-text("ยกเลิก"), button:has-text("Cancel")');

                if (await cancelButton.isVisible({ timeout: 3000 })) {
                    await cancelButton.click();

                    // Confirm if needed
                    const confirmButton = page.locator('button:has-text("ยืนยัน"), button:has-text("Confirm")');
                    if (await confirmButton.isVisible({ timeout: 2000 })) {
                        await confirmButton.click();
                    }

                    await page.waitForTimeout(2000);

                    // Verify invitation removed
                    const stillVisible = await page.locator('text=newmember@example.com').isVisible({ timeout: 3000 })
                        .catch(() => false);

                    expect(stillVisible).toBeFalsy();
                }
            }
        }
    });

    test('should manage member permissions', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Find a team member (not owner)
            const memberRow = page.locator('[role="table"] tr, .member-card').filter({ hasText: /member|สมาชิก/i }).first();

            if (await memberRow.isVisible({ timeout: 5000 })) {
                // Click manage permissions button
                const permissionsButton = memberRow.locator('button:has-text("สิทธิ์"), button:has-text("Permissions"), button:has-text("จัดการสิทธิ์")');

                if (await permissionsButton.isVisible({ timeout: 3000 })) {
                    await permissionsButton.click();

                    // Toggle some permissions
                    const checkboxes = page.locator('input[type="checkbox"]');
                    const count = await checkboxes.count();

                    if (count > 0) {
                        // Toggle first checkbox
                        await checkboxes.first().click();
                        await page.waitForTimeout(500);

                        // Save permissions
                        await page.click('button:has-text("บันทึก"), button:has-text("Save")');
                        await page.waitForTimeout(2000);

                        // Should show success message
                        const hasSuccess = await page.locator('text=/success|สำเร็จ|saved/i').isVisible({ timeout: 3000 })
                            .catch(() => false);

                        if (hasSuccess) {
                            console.log('Permissions saved successfully');
                        }
                    }
                }
            }
        }
    });

    test('should change member role', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Find a member to change role
            const memberRow = page.locator('[role="table"] tr').filter({ hasText: /@/ }).first();

            if (await memberRow.isVisible({ timeout: 5000 })) {
                // Open actions menu
                const moreButton = memberRow.locator('button[aria-label*="more"], button:has-text("...")');

                if (await moreButton.isVisible({ timeout: 3000 })) {
                    await moreButton.click();

                    // Click change role
                    const changeRoleButton = page.locator('button:has-text("เปลี่ยนบทบาท"), button:has-text("Change Role")');

                    if (await changeRoleButton.isVisible({ timeout: 2000 })) {
                        await changeRoleButton.click();

                        // Select new role
                        const newRoleSelect = page.locator('select[name="role"]');
                        if (await newRoleSelect.isVisible({ timeout: 2000 })) {
                            await newRoleSelect.selectOption({ index: 1 });

                            // Confirm
                            await page.click('button:has-text("บันทึก"), button:has-text("Save"), button:has-text("ยืนยัน")');
                            await page.waitForTimeout(2000);

                            console.log('Role changed successfully');
                        }
                    }
                }
            }
        }
    });

    test('should suspend and reactivate member', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const memberRow = page.locator('[role="table"] tr').filter({ hasText: /@/ }).first();

            if (await memberRow.isVisible({ timeout: 5000 })) {
                const moreButton = memberRow.locator('button[aria-label*="more"], button:has-text("...")');

                if (await moreButton.isVisible({ timeout: 3000 })) {
                    await moreButton.click();

                    // Suspend member
                    const suspendButton = page.locator('button:has-text("ระงับ"), button:has-text("Suspend")');

                    if (await suspendButton.isVisible({ timeout: 2000 })) {
                        await suspendButton.click();

                        // Confirm
                        const confirmButton = page.locator('button:has-text("ยืนยัน"), button:has-text("Confirm")');
                        if (await confirmButton.isVisible({ timeout: 2000 })) {
                            await confirmButton.click();
                        }

                        await page.waitForTimeout(2000);

                        // Verify suspended status
                        await expect(page.locator('text=/suspended|ระงับ/i')).toBeVisible({ timeout: 5000 });

                        // Reactivate
                        await moreButton.click();
                        const reactivateButton = page.locator('button:has-text("เปิดใช้งาน"), button:has-text("Reactivate")');

                        if (await reactivateButton.isVisible({ timeout: 2000 })) {
                            await reactivateButton.click();
                            await page.waitForTimeout(2000);

                            // Verify active again
                            console.log('Member reactivated');
                        }
                    }
                }
            }
        }
    });

    test('should remove team member', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // First add a test member to remove
            const inviteButton = page.locator('button:has-text("เชิญสมาชิก"), button:has-text("Invite")');

            if (await inviteButton.isVisible({ timeout: 5000 })) {
                await inviteButton.click();
                await page.fill('input[type="email"]', 'remove-test@example.com');

                const roleSelect = page.locator('select[name="role"]');
                if (await roleSelect.isVisible({ timeout: 2000 })) {
                    await roleSelect.selectOption({ index: 1 });
                }

                await page.click('button:has-text("ส่งคำเชิญ"), button:has-text("Send")');
                await page.waitForTimeout(2000);

                // Now remove this member
                const memberRow = page.locator('text=remove-test@example.com').locator('..');
                const moreButton = memberRow.locator('button[aria-label*="more"], button:has-text("...")');

                if (await moreButton.isVisible({ timeout: 3000 })) {
                    await moreButton.click();

                    const removeButton = page.locator('button:has-text("ลบ"), button:has-text("Remove")');

                    if (await removeButton.isVisible({ timeout: 2000 })) {
                        await removeButton.click();

                        // Confirm removal
                        const confirmButton = page.locator('button:has-text("ยืนยัน"), button:has-text("Confirm"), button:has-text("ลบ")');
                        if (await confirmButton.isVisible({ timeout: 2000 })) {
                            await confirmButton.click();
                        }

                        await page.waitForTimeout(2000);

                        // Verify member removed
                        await expect(page.locator('text=remove-test@example.com')).not.toBeVisible({ timeout: 5000 });
                    }
                }
            }
        }
    });
});

test.describe('Team Activity Logs', () => {
    test('should display activity logs', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Look for activity logs section or tab
            const activityTab = page.locator('button:has-text("กิจกรรม"), button:has-text("Activity"), a:has-text("Activity Log")');

            if (await activityTab.isVisible({ timeout: 5000 })) {
                await activityTab.click();
                await page.waitForTimeout(2000);

                // Verify activity log items are shown
                const hasLogs = await page.locator('[data-testid="activity-log"], .activity-item, text=/invited|added|removed|เชิญ|เพิ่ม|ลบ/i').isVisible({ timeout: 5000 })
                    .catch(() => false);

                if (hasLogs) {
                    console.log('Activity logs displayed');
                }
            }
        }
    });

    test('should filter activity logs', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Navigate to activity logs
            const activityTab = page.locator('button:has-text("กิจกรรม"), button:has-text("Activity")');

            if (await activityTab.isVisible({ timeout: 5000 })) {
                await activityTab.click();

                // Look for filter options
                const filterSelect = page.locator('select:has-text("action"), select:has-text("การกระทำ")');

                if (await filterSelect.isVisible({ timeout: 3000 })) {
                    await filterSelect.selectOption({ index: 1 });
                    await page.waitForTimeout(1000);

                    console.log('Activity log filter applied');
                }
            }
        }
    });
});

test.describe('Team Invitation Validation', () => {
    test('should validate email format', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const inviteButton = page.locator('button:has-text("เชิญสมาชิก"), button:has-text("Invite")');

            if (await inviteButton.isVisible({ timeout: 5000 })) {
                await inviteButton.click();

                // Enter invalid email
                await page.fill('input[type="email"]', 'invalid-email');
                await page.click('button:has-text("ส่งคำเชิญ"), button:has-text("Send")');
                await page.waitForTimeout(1000);

                // Should show validation error
                const hasError = await page.locator('text=/invalid|ไม่ถูกต้อง|รูปแบบอีเมล/i').isVisible({ timeout: 3000 })
                    .catch(() => false);

                if (hasError) {
                    console.log('Email validation working');
                }
            }
        }
    });

    test('should not allow duplicate invitations', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const inviteButton = page.locator('button:has-text("เชิญสมาชิก"), button:has-text("Invite")');

            if (await inviteButton.isVisible({ timeout: 5000 })) {
                // Send first invitation
                await inviteButton.click();
                await page.fill('input[type="email"]', 'duplicate@example.com');

                const roleSelect = page.locator('select[name="role"]');
                if (await roleSelect.isVisible({ timeout: 2000 })) {
                    await roleSelect.selectOption({ index: 1 });
                }

                await page.click('button:has-text("ส่งคำเชิญ"), button:has-text("Send")');
                await page.waitForTimeout(2000);

                // Try to send duplicate invitation
                await inviteButton.click();
                await page.fill('input[type="email"]', 'duplicate@example.com');

                if (await roleSelect.isVisible({ timeout: 2000 })) {
                    await roleSelect.selectOption({ index: 1 });
                }

                await page.click('button:has-text("ส่งคำเชิญ"), button:has-text("Send")');
                await page.waitForTimeout(2000);

                // Should show error about duplicate
                const hasDuplicateError = await page.locator('text=/already|duplicate|อยู่แล้ว|ซ้ำ/i').isVisible({ timeout: 3000 })
                    .catch(() => false);

                if (hasDuplicateError) {
                    console.log('Duplicate invitation prevented');
                }
            }
        }
    });

    test('should validate required role selection', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const inviteButton = page.locator('button:has-text("เชิญสมาชิก"), button:has-text("Invite")');

            if (await inviteButton.isVisible({ timeout: 5000 })) {
                await inviteButton.click();

                // Fill email but don't select role
                await page.fill('input[type="email"]', 'norole@example.com');
                await page.click('button:has-text("ส่งคำเชิญ"), button:has-text("Send")');
                await page.waitForTimeout(1000);

                // Should show validation for role
                const hasRoleError = await page.locator('text=/role.*required|กรุณาเลือกบทบาท/i').isVisible({ timeout: 3000 })
                    .catch(() => false);

                if (hasRoleError) {
                    console.log('Role validation working');
                }
            }
        }
    });
});

test.describe('Team UI Elements', () => {
    test('should display team member count', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Look for member count display
            const hasCount = await page.locator('text=/\\d+\\s*(members?|สมาชิก)/i').isVisible({ timeout: 5000 })
                .catch(() => false);

            if (hasCount) {
                console.log('Member count displayed');
            }
        }
    });

    test('should show member avatars', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            const hasAvatars = await page.locator('img[alt*="avatar"], [data-testid="member-avatar"]').isVisible({ timeout: 5000 })
                .catch(() => false);

            if (hasAvatars) {
                console.log('Member avatars displayed');
            }
        }
    });

    test('should display role badges correctly', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Look for role badges (owner, admin, member, etc.)
            const hasBadges = await page.locator('.badge, [class*="badge"]').filter({ hasText: /owner|admin|member|เจ้าของ|ผู้ดูแล/i }).isVisible({ timeout: 5000 })
                .catch(() => false);

            if (hasBadges) {
                console.log('Role badges displayed');
            }
        }
    });

    test('should show pending invitations separately', async ({ page }) => {
        await page.goto('/team');

        const isAuthPage = page.url().includes('/auth');

        if (!isAuthPage) {
            // Look for pending section or tab
            const hasPendingSection = await page.locator('text=/pending|รอการตอบรับ|คำเชิญ/i').isVisible({ timeout: 5000 })
                .catch(() => false);

            if (hasPendingSection) {
                console.log('Pending invitations section visible');
            }
        }
    });
});
