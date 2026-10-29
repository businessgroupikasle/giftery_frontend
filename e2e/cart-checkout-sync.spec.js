import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser } from './helpers/app.js';

const product = { id: 'product-1', name: 'Gift Box', price: 1000, stock: 10, images: [] };
const item = { id: 'cart-1', productId: product.id, product, quantity: 1, customization: { text: { value: 'Hello' } } };

test('cart checkout verifies the server cart, omits items, and does not clear it separately', async ({ page }) => {
  await seedAuthenticatedUser(page);
  await mockApi(page);
  let items = [item];
  let orderPayload;
  let deletes = 0;
  await page.route('**/api/v1/cart', async (route) => {
    if (route.request().method() === 'DELETE') deletes += 1;
    await route.fulfill({ json: { data: { cart: { items } } } });
  });
  await page.route('**/api/v1/orders', async (route) => {
    orderPayload = route.request().postDataJSON();
    items = [];
    await route.fulfill({ json: { data: { order: { id: 'order-1', status: 'PENDING' } } } });
  });
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Gift Box' })).toBeVisible();
  await page.getByRole('button', { name: /proceed to checkout/i }).click();
  await page.locator('input[name="fullName"]').fill('Test Customer');
  await page.locator('input[name="email"]').fill('customer@example.com');
  await page.locator('input[name="phone"]').fill('9876543210');
  await page.locator('input[name="pincode"]').fill('600001');
  await page.locator('input[name="addressLine1"]').fill('12 Test Street');
  await page.locator('input[name="city"]').fill('Chennai');
  await page.locator('input[name="state"]').fill('Tamil Nadu');
  await page.getByRole('button', { name: /proceed to payment/i }).click();
  await page.getByText('Cash on Delivery (COD)', { exact: true }).click();
  await page.getByRole('button', { name: /place order via cod/i }).click();
  await expect(page.getByRole('heading', { name: /Thank You For Your Order/i })).toBeVisible();
  expect(orderPayload).not.toHaveProperty('items');
  expect(deletes).toBe(0);
});
