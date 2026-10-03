import { test, expect } from '@playwright/test';
import { mockApi, seedStorage } from './helpers/app.js';

test.describe('Maintenance mode', () => {
  test('blocks storefront pages for regular visitors', async ({ page }) => {
    await seedStorage(page, { store_basic_settings: { maintenanceMode: true } });
    await mockApi(page, { maintenanceMode: true });
    await page.goto('/corporate-gifts');

    await expect(page.getByRole('heading', { name: /under maintenance/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin Login' })).toHaveAttribute('href', '/login');
  });

  test('keeps authentication routes available during maintenance', async ({ page }) => {
    await seedStorage(page, { store_basic_settings: { maintenanceMode: true } });
    await mockApi(page, { maintenanceMode: true });
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'GIFTERY' })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
  });
});