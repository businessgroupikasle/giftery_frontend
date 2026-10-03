import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser, seedStorage } from './helpers/app.js';

test('dashboard replaces internal database IDs with stable public IDs', async ({ page }) => {
  await seedAuthenticatedUser(page, 'SUPER_ADMIN');
  await seedStorage(page, {
    giftery_cleaned_mock_v2: 'true',
    registered_users: [{
      id: 'cmus89pot0000a4b5y2s2yvrk', name: 'Customer One',
      email: 'customer@example.com', phone: '9876543210', role: 'CUSTOMER', status: 'Active',
    }],
    giftery_orders: [{
      id: 'cmur0j4h00004efntcu07hqsz', createdAt: '2026-10-03T08:00:00.000Z',
      status: 'PENDING', customerName: 'Customer One', totalAmount: 799,
      items: [{ id: 'product-1', name: 'Gift Box', price: 799, quantity: 1 }],
    }],
  });
  await mockApi(page);
  await page.goto('/dashboard');

  await page.getByText('Customers', { exact: true }).first().click();
  await expect(page.getByText(/^CUS-2026-[A-Z0-9]{7}$/)).toBeVisible();
  await expect(page.getByText('cmus89pot0000a4b5y2s2yvrk')).toHaveCount(0);

  await page.getByText('Orders', { exact: true }).first().click();
  await expect(page.getByText(/^#ORD-2026-[A-Z0-9]{7}$/)).toBeVisible();
  await expect(page.getByText('cmur0j4h00004efntcu07hqsz')).toHaveCount(0);
});
