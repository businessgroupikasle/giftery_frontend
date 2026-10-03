import { test, expect } from '@playwright/test';
import { mockApi } from './helpers/app.js';

test.describe('Routing and access control', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  for (const route of ['/orders', '/profile', '/dashboard', '/super-admin/dashboard']) {
    test(`redirects unauthenticated visitors from ${route} to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
    });
  }

  test('legacy shop route redirects to corporate gifts', async ({ page }) => {
    await page.goto('/shop');
    await expect(page).toHaveURL(/\/corporate-gifts$/);
  });

  test('privacy alias redirects to the canonical route', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveURL(/\/privacy-policy$/);
  });
});