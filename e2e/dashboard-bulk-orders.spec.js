import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser } from './helpers/app.js';

const inquiry = {
  id: 'ENQ-2026-0042', type: 'BULK_ORDER', status: 'New', name: 'Priya Raman', email: 'priya@example.com',
  phone: '+919876543210', company: 'Acme Ltd', productId: 'p1', productName: 'Cuddly Teddy Bear',
  productSku: 'TOY-SOFT-003', quantity: 150, requirements: null, createdAt: '2026-11-27T08:00:00.000Z',
};
const page1 = { data: [inquiry], meta: { page: 1, totalPages: 1, total: 1 }, counts: { New: 1 } };

test('bulk orders list recovers on its own after the backend restarts', async ({ page }) => {
  await seedAuthenticatedUser(page, 'SUPER_ADMIN');
  await mockApi(page);
  await page.route('**/api/v1/dashboard/summary*', (route) => route.fulfill({ json: { success: true, data: {} } }));
  let serverUp = false;
  await page.route('**/api/v1/enquiries/bulk-orders*', (route) => (serverUp
    ? route.fulfill({ json: { success: true, data: page1 } })
    : route.fulfill({ status: 503, json: { success: false, message: 'restarting' } })));

  await page.goto('/dashboard');
  await page.getByText('Bulk Orders', { exact: true }).first().click();
  await expect(page.getByRole('alert').filter({ hasText: 'Bulk inquiries could not be loaded' })).toBeVisible({ timeout: 15000 });

  serverUp = true; // nobody clicks Retry
  await expect(page.getByText('Priya Raman').first()).toBeVisible({ timeout: 25000 });
  await expect(page.getByRole('alert').filter({ hasText: 'could not be loaded' })).toHaveCount(0);
});
