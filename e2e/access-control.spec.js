import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser } from './helpers/app.js';

test.describe('Role-based dashboard access', () => {
  test('allows a store admin to open the dashboard', async ({ page }) => {
    await seedAuthenticatedUser(page, 'STORE_ADMIN');
    await mockApi(page);
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.locator('#root')).not.toContainText('Loading...', { timeout: 15_000 });
    await expect(page.locator('#root')).toContainText(/dashboard/i);
  });

  test('redirects a customer away from the admin dashboard', async ({ page }) => {
    await seedAuthenticatedUser(page, 'USER');
    await mockApi(page);
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/$/);
  });

  test('prevents a regular admin from opening the super-admin dashboard', async ({ page }) => {
    await seedAuthenticatedUser(page, 'ADMIN');
    await mockApi(page);
    await page.goto('/super-admin/dashboard');

    await expect(page).toHaveURL(/\/$/);
  });
});