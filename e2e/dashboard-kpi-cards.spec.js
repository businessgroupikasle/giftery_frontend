import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser } from './helpers/app.js';

const summary = {
  range: { from: null, to: null },
  revenue: { total: 152340 },
  orders: { total: 42, open: 7, delivered: 30 },
  products: { total: 10, lowStock: 2, outOfStock: 1 },
  categories: { total: 45 },
  customizations: { total: 6, pendingReview: 3 },
  customers: { total: 18 },
  enquiries: { total: 9, new: 4 },
  bulkOrders: { total: 5, new: 2, units: 1250 },
  appointments: { total: 3, new: 1 },
  catalogueRequests: { total: 2, new: 0 },
  coupons: { total: 4, live: 2 },
  staff: { total: 2, admins: 1, superAdmins: 1, vendors: 0 },
};

const SIDEBAR_CARDS = [
  'Total Revenue', 'Products', 'Categories', 'Orders', 'Customized Products', 'Customers',
  'Enquiries', 'Bulk Orders', 'Appointments', 'Catalogue Requests', 'Coupons & Offers', 'Users & Roles',
];


test.describe('Dashboard overview KPI cards', () => {
  test('shows one live card per sidebar section from the summary API', async ({ page }) => {
    await seedAuthenticatedUser(page, 'SUPER_ADMIN');
    await mockApi(page);
    const requests = [];
    await page.route('**/api/v1/dashboard/summary*', (route) => {
      requests.push(new URL(route.request().url()).searchParams);
      return route.fulfill({ json: { success: true, data: summary } });
    });
    await page.goto('/dashboard');

    for (const label of SIDEBAR_CARDS) {
      await expect(page.getByTitle(`Open ${label}`)).toBeVisible();
    }
    await expect(page.getByTitle('Open Total Revenue')).toContainText('₹1,52,340');
    await expect(page.getByTitle('Open Products')).toContainText('10');
    await expect(page.getByTitle('Open Products')).toContainText('2 low stock');
    await expect(page.getByTitle('Open Products')).toContainText('1 out of stock');
    await expect(page.getByTitle('Open Categories')).toContainText('45');
    await expect(page.getByTitle('Open Orders')).toContainText('7 open');
    await expect(page.getByTitle('Open Customized Products')).toContainText('3 awaiting review');
    await expect(page.getByTitle('Open Bulk Orders')).toContainText('1,250 units');
    await expect(page.getByTitle('Open Coupons & Offers')).toContainText('2 live now');
    await expect(page.getByTitle('Open Users & Roles')).toContainText('1 super admin');
    await expect(page.getByText(/vs previous period/)).toHaveCount(0);

    // Default filter is Last 30 Days: activity cards say so, totals say "Current total".
    await expect(page.getByTitle('Open Orders')).toContainText('Last 30 Days');
    await expect(page.getByTitle('Open Categories')).toContainText('Current total');
    const first = requests[0];
    expect(first.get('from')).toBeTruthy();
    expect(Date.parse(first.get('to')) - Date.parse(first.get('from'))).toBeGreaterThan(29 * 864e5);
  });

  test('clicking a card opens that sidebar section', async ({ page }) => {
    await seedAuthenticatedUser(page, 'SUPER_ADMIN');
    await mockApi(page);
    await page.route('**/api/v1/dashboard/summary*', (route) => route.fulfill({ json: { success: true, data: summary } }));
    await page.goto('/dashboard');
    await page.getByTitle('Open Bulk Orders').click();
    await expect(page.getByText('Bulk Order Inquiries').first()).toBeVisible();
  });

  test('changing the date filter reloads the counts for that period', async ({ page }) => {
    await seedAuthenticatedUser(page, 'SUPER_ADMIN');
    await mockApi(page);
    const requests = [];
    await page.route('**/api/v1/dashboard/summary*', (route) => {
      requests.push(new URL(route.request().url()).searchParams);
      return route.fulfill({ json: { success: true, data: summary } });
    });
    await page.goto('/dashboard');
    await expect(page.getByTitle('Open Orders')).toContainText('Last 30 Days');

    await page.getByRole('button', { name: /Filter/ }).click();
    await page.getByText('Today', { exact: true }).click();
    await expect(page.getByTitle('Open Orders')).toContainText('Today');
    const last = requests.at(-1);
    const span = Date.parse(last.get('to')) - Date.parse(last.get('from'));
    expect(span).toBeLessThan(864e5);
  });

  test('a failed load shows a retry instead of fake zeros', async ({ page }) => {
    await seedAuthenticatedUser(page, 'SUPER_ADMIN');
    await mockApi(page);
    // The API client retries failed GETs on its own, so stay down until "Retry" is clicked.
    let serverUp = false;
    await page.route('**/api/v1/dashboard/summary*', (route) => (serverUp
      ? route.fulfill({ json: { success: true, data: summary } })
      : route.fulfill({ status: 500, json: { success: false, message: 'boom' } })));
    await page.goto('/dashboard');
    await expect(page.getByRole('alert').filter({ hasText: "Couldn't load the live dashboard counts" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByTitle('Open Products').locator('h2')).toHaveText('—');
    serverUp = true;
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByTitle('Open Products').locator('h2')).toHaveText('10');
  });
});
