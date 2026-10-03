import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser, seedCart } from './helpers/app.js';

test('dashboard applies pricing settings through the API and storefront', async ({ page }) => {
  await seedAuthenticatedUser(page, 'SUPER_ADMIN');
  await seedCart(page, [{ id: 'product-1', name: 'Premium Gift', price: 1299, quantity: 1 }]);
  await mockApi(page);

  let savedPayload;
  await page.route('**/api/v1/settings', async (route) => {
    if (route.request().method() === 'PUT') {
      savedPayload = route.request().postDataJSON();
      await route.fulfill({ json: { success: true, data: {
        freeShippingThreshold: '3000',
        taxRate: 5,
      } } });
      return;
    }
    await route.fulfill({ json: { success: true, data: {
      freeShippingThreshold: savedPayload ? '3000' : '999',
      standardShippingFee: savedPayload ? undefined : '99',
      taxRate: savedPayload ? 5 : 18,
    } } });
  });

  await page.goto('/dashboard');
  await page.getByText('Settings', { exact: true }).click();
  await page.locator('input[name="freeShippingThreshold"]').fill('3000');
  await page.locator('input[name="standardShippingFee"]').fill('199');
  await page.locator('input[name="taxPercentage"]').fill('5');
  await page.getByRole('button', { name: /save settings/i }).click();

  await expect(page.getByText('Store settings applied successfully.')).toBeVisible();
  expect(savedPayload).toMatchObject({
    freeShippingThreshold: 3000,
    standardShippingFee: 199,
    shippingFee: 199,
    taxPercentage: 5,
    taxRate: 5,
  });

  await page.goto('/cart');
  const summary = page.getByText('Order Summary').locator('..');
  await expect(summary).toContainText('₹199');
  await expect(summary).toContainText('GST (5%)');
});
