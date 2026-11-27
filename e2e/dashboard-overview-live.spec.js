import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser, seedStorage } from './helpers/app.js';

const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000).toISOString();

const overview = (overrides = {}) => ({
  generatedAt: new Date().toISOString(),
  sales: { range: 'week', labels: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'], current: [0, 1200, 0, 3400, 800, 0, 2200], previous: [500, 0, 900, 0, 1200, 300, 0], total: 7600, previousTotal: 2900, peak: { label: 'Mon', value: 3400 } },
  categories: { range: 'week', total: 7600, categories: [{ name: 'Corporate Gifts', revenue: 5000, units: 10, pct: 65.8 }, { name: 'Toys', revenue: 2600, units: 6, pct: 34.2 }] },
  orderStatus: { range: 'week', total: 5, delivered: 2, shipped: 0, processing: 1, pending: 1, cancelled: 1 },
  topProducts: { range: 'all', products: [{ id: 'p1', name: 'Executive Desk Kit', sku: 'EDK-1', image: null, stock: 40, unitsSold: 12, revenue: 23880 }] },
  activity: [
    { type: 'order', id: 'o1', at: minutesAgo(5), tab: 'orders', reference: 'ORD-2026-0007', customer: 'Kavya R', amount: 2200, paymentMethod: 'RAZORPAY' },
    { type: 'bulk', id: 'ENQ-2026-0003', at: minutesAgo(130), tab: 'bulk-orders', reference: 'ENQ-2026-0003', customer: 'Acme Ltd', productName: 'Cuddly Teddy Bear', quantity: 500 },
    { type: 'lowStock', id: 'p2', at: minutesAgo(60 * 26), tab: 'products', productName: 'Photo Mug', stock: 4 },
  ],
  quickStats: { lowStock: 3, outOfStock: 1, newCustomersThisWeek: 2, newBulkInquiries: 4 },
  ...overrides,
});

async function openDashboard(page, data) {
  await seedAuthenticatedUser(page, 'SUPER_ADMIN');
  await seedStorage(page, { giftery_cleaned_mock_v2: 'true' });
  await mockApi(page);
  const requests = [];
  await page.route('**/api/v1/dashboard/overview**', async (route) => {
    requests.push(Object.fromEntries(new URL(route.request().url()).searchParams));
    await route.fulfill({ json: { success: true, data } });
  });
  await page.goto('/dashboard#dashboard');
  return requests;
}

test('overview cards show live data from GET /dashboard/overview', async ({ page }) => {
  const requests = await openDashboard(page, overview());

  await expect(page.getByText(/New order ORD-2026-0007 placed by Kavya R · ₹2,200 \(paid online\)/)).toBeVisible();
  await expect(page.getByText('5 mins ago')).toBeVisible();
  await expect(page.getByText(/Bulk order inquiry for 500 × Cuddly Teddy Bear from Acme Ltd/)).toBeVisible();
  await expect(page.getByText('2 hours ago')).toBeVisible();
  await expect(page.getByText(/Low stock alert for Photo Mug \(4 left\)/)).toBeVisible();
  await expect(page.getByText('1 day ago')).toBeVisible();

  await expect(page.getByText('12 sold · 40 in stock')).toBeVisible();
  await expect(page.getByText('₹23,880')).toBeVisible();
  await expect(page.getByText('Corporate Gifts')).toBeVisible();
  await expect(page.getByText('Peak · Mon')).toBeVisible();
  await expect(page.getByText('▲ 162%')).toBeVisible();
  await expect(page.getByText('Waiting for a reply')).toBeVisible();

  for (const fake of ['Tech Solutions', 'Apex Infotech', 'Little Explorers Preschool', 'Executive Leather Journal']) {
    await expect(page.getByText(fake)).toHaveCount(0);
  }

  await page.screenshot({ path: 'test-results/dashboard-overview-live.png', fullPage: true });

  await page.getByLabel('Sales overview period').selectOption('year');
  await expect.poll(() => requests.some((r) => r.sales === 'year')).toBe(true);
  await page.getByLabel('Order status period').selectOption('all');
  await expect.poll(() => requests.some((r) => r.status === 'all')).toBe(true);
});

test('an empty store shows honest empty states, not sample data', async ({ page }) => {
  await openDashboard(page, overview({
    sales: { range: 'week', labels: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'], current: [0, 0, 0, 0, 0, 0, 0], previous: [0, 0, 0, 0, 0, 0, 0], total: 0, previousTotal: 0, peak: null },
    categories: { range: 'week', total: 0, categories: [] },
    orderStatus: { range: 'week', total: 0, delivered: 0, shipped: 0, processing: 0, pending: 0, cancelled: 0 },
    topProducts: { range: 'all', products: [] },
    activity: [],
    quickStats: { lowStock: 0, outOfStock: 0, newCustomersThisWeek: 0, newBulkInquiries: 0 },
  }));

  await expect(page.getByText('No sales in this period yet.')).toBeVisible();
  await expect(page.getByText('No category sales in this period yet.')).toBeVisible();
  await expect(page.getByText('No orders in this period yet.')).toBeVisible();
  await expect(page.getByText(/No products sold yet/)).toBeVisible();
  await expect(page.getByText('No activity yet.')).toBeVisible();
  await expect(page.getByText(/Sold$/)).toHaveCount(0);
  await page.screenshot({ path: 'test-results/dashboard-overview-empty.png', fullPage: true });
});
