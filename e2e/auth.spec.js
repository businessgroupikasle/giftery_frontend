import { test, expect } from '@playwright/test';
import { collectPageErrors, mockApi } from './helpers/app.js';

test.describe('Authentication UI', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto('/login');
  });

  test('switches between sign-in and registration forms', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Account' }).first().click();
    await expect(page.getByPlaceholder('e.g. Alexander Vance')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. 9876543210')).toBeVisible();

    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await expect(page.getByPlaceholder('name@company.com')).toBeVisible();
    await expect(page.getByText('Forgot password?')).toBeVisible();
  });

  test('navigates to the forgot-password recovery flow', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot password?' }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible();
    await expect(page.getByPlaceholder('name@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: /send verification otp/i })).toBeVisible();
  });

  test('toggles password visibility without runtime errors', async ({ page }) => {
    const errors = collectPageErrors(page);
    const password = page.locator('input[name="password"]');
    await password.fill('SecurePassword123!');
    await expect(password).toHaveAttribute('type', 'password');

    await password.locator('xpath=following-sibling::button').click();
    await expect(password).toHaveAttribute('type', 'text');
    expect(errors).toEqual([]);
  });

  test('shows the backend login error', async ({ page }) => {
    await page.locator('input[name="email"]').fill('user@example.com');
    await page.locator('input[name="password"]').fill('WrongPassword123!');
    await page.getByRole('button', { name: /sign in to dashboard/i }).click();

    await expect(page.getByText('Invalid username or password.').first()).toBeVisible();
  });
});