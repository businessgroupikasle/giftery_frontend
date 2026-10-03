import { test, expect } from '@playwright/test';
import { mockApi, seedCart } from './helpers/app.js';

const cartItem = (overrides = {}) => ({
  id: 'product-1',
  productId: 'product-1',
  name: 'Premium Gift Box',
  price: 1000,
  quantity: 1,
  image: '/placeholder-product.png',
  maxStock: 10,
  ...overrides,
});

test.describe('Cart pricing business logic', () => {
  test('applies a fixed discount and recalculates the grand total', async ({ page }) => {
    await seedCart(page, [cartItem()]);
    await mockApi(page);
    await page.goto('/cart');

    await page.getByPlaceholder('Enter coupon code').fill('WELCOME10');
    await page.getByRole('button', { name: 'Apply' }).click();

    await expect(page.getByText(/WELCOME10/).first()).toBeVisible();
    await expect(page.getByText('-₹100.00')).toBeVisible();
    await expect(page.getByText('₹999.00')).toBeVisible();
  });

  test('applies percentage discount codes case-insensitively', async ({ page }) => {
    await seedCart(page, [cartItem({ price: 2000 })]);
    await mockApi(page);
    await page.goto('/cart');

    await page.getByPlaceholder('Enter coupon code').fill('giftery10');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText('-₹200.00')).toBeVisible();
  });

  test('shows an error and does not change totals for an invalid coupon', async ({ page }) => {
    await seedCart(page, [cartItem()]);
    await mockApi(page);
    await page.goto('/cart');

    await page.getByPlaceholder('Enter coupon code').fill('NOT-A-COUPON');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText(/Invalid or expired coupon code/i)).toBeVisible();
    await expect(page.getByText('₹1,099.00')).toBeVisible();
  });

  test('unlocks free shipping at the configured threshold', async ({ page }) => {
    await seedCart(page, [cartItem({ price: 5000 })]);
    await mockApi(page);
    await page.goto('/cart');

    await expect(page.getByText(/eligible for free shipping/i)).toBeVisible();
    await expect(page.getByText('FREE', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('₹5,000.00').last()).toBeVisible();
  });
});