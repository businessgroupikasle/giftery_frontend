import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser, seedStorage } from './helpers/app.js';

const inquiry = {
  id: 'ENQ-2026-0042',
  name: 'Ponraj P',
  email: 'buyer@example.com',
  phone: '+919734523453',
  company: 'Acme Gifts',
  requirements: 'Logo print on every bear',
  productId: 'p1',
  productName: 'Cuddly Teddy Bear',
  productSku: 'TOY-SOFT-003',
  quantity: 500,
  status: 'New',
  createdAt: '2026-11-27T08:00:00.000Z',
  product: { slug: 'cuddly-teddy-bear', images: [], isActive: true },
};

test('admin sees bulk order inquiries in their own tab and can move them along the pipeline', async ({ page }) => {
  await seedAuthenticatedUser(page, 'SUPER_ADMIN');
  await seedStorage(page, { giftery_cleaned_mock_v2: 'true' });
  await mockApi(page);

  const requests = { list: [], status: [] };
  let current = { ...inquiry };
  // Registered after mockApi, so it takes precedence for these paths.
  await page.route('**/api/v1/enquiries/bulk-orders**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === 'PATCH') {
      requests.status.push({ path: url.pathname, body: request.postDataJSON(), auth: request.headers().authorization });
      current = { ...current, status: request.postDataJSON().status };
      await route.fulfill({ json: { success: true, data: current } });
      return;
    }
    requests.list.push(Object.fromEntries(url.searchParams));
    const rows = url.searchParams.get('status') && url.searchParams.get('status') !== current.status ? [] : [current];
    await route.fulfill({ json: { success: true, data: { data: rows, meta: { page: 1, limit: 20, total: rows.length, totalPages: 1 }, counts: { [current.status]: 1 } } } });
  });

  await page.goto('/dashboard');
  await page.getByRole('button', { name: /bulk orders/i }).first().click();

  await expect(page.getByRole('heading', { name: 'Bulk Order Inquiries', level: 1 })).toBeVisible();
  const row = page.getByRole('row', { name: /ENQ-2026-0042/ });
  await expect(row).toContainText('Cuddly Teddy Bear');
  await expect(row).toContainText('SKU: TOY-SOFT-003');
  await expect(row).toContainText('500');
  await expect(row).toContainText('Ponraj P');
  await expect(row).toContainText('Acme Gifts');
  await expect(page.getByRole('button', { name: 'New (1)' })).toBeVisible();

  await row.getByRole('combobox', { name: /status for bulk inquiry/i }).selectOption('Quoted');
  await expect.poll(() => requests.status.length).toBe(1);
  expect(requests.status[0].path).toMatch(/\/enquiries\/bulk-orders\/ENQ-2026-0042\/status$/);
  expect(requests.status[0].body).toEqual({ status: 'Quoted' });
  expect(requests.status[0].auth).toMatch(/^Bearer /);
  await expect(page.getByRole('button', { name: 'Quoted (1)' })).toBeVisible();

  await row.getByRole('button', { name: /view bulk inquiry/i }).click();
  const details = page.getByRole('dialog', { name: /bulk inquiry ENQ-2026-0042/i });
  await expect(details).toContainText('Logo print on every bear');
  await expect(details).toContainText('buyer@example.com');
  await expect(details.getByRole('link', { name: 'Cuddly Teddy Bear' })).toHaveAttribute('href', '/product/cuddly-teddy-bear');

  await page.getByRole('button', { name: 'Close details' }).click();
  await page.getByRole('searchbox', { name: /search bulk inquiries/i }).fill('acme');
  await expect.poll(() => requests.list.some((params) => params.search === 'acme')).toBe(true);
});
