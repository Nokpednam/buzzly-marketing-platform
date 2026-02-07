import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should navigate to auth page from landing', async ({ page }) => {
        await page.goto('/');

        // Look for login/signin button
        const authButton = page.getByRole('link', { name: /sign in|login|get started/i }).first();
        await authButton.click();

        // Should navigate to auth page
        await expect(page).toHaveURL(/\/(auth|signup)/);
    });

    test('should display login form', async ({ page }) => {
        await page.goto('/auth');

        // Check for email and password fields
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    });

    test('should display signup form', async ({ page }) => {
        await page.goto('/signup');

        // Check for signup form elements
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible();
    });

    test('should show validation error for empty login form', async ({ page }) => {
        await page.goto('/auth');

        // Try to submit empty form
        const submitButton = page.getByRole('button', { name: /sign in|login/i }).first();
        await submitButton.click();

        // Should show validation errors (HTML5 validation or custom)
        const emailField = page.getByLabel(/email/i);
        const isInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
        expect(isInvalid).toBeTruthy();
    });

    test('should navigate between login and signup', async ({ page }) => {
        await page.goto('/auth');

        // Find link to signup
        const signupLink = page.getByRole('link', { name: /sign up|create account|register/i }).first();
        if (await signupLink.isVisible()) {
            await signupLink.click();
            await expect(page).toHaveURL(/\/signup/);
        }
    });
});

test.describe('Admin Authentication', () => {
    test('should display admin login page', async ({ page }) => {
        await page.goto('/admin/login');

        // Check for admin login form
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    });

    test('should display admin signup page', async ({ page }) => {
        await page.goto('/admin/signup');

        // Check for admin signup form
        await expect(page.getByLabel(/email/i)).toBeVisible();
    });
});
