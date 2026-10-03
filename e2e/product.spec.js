import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser } from './helpers/app.js';

const product = {
  id: 'product-101',
  slug: 'executive-gift-box',
  name: 'Executive Gift Box',
  price: 1200,
  comparePrice: 1500,
  stock: 3,
  minOrder: 1,
  description: 'A premium corporate gift collection.',
  images: ['/placeholder-product.png'],
  category: { id: 'cat-1', name: 'Corporate Gifts', slug: 'corporate-gifts' },
};

test.describe('Product purchase functionality', () => {
  test('renders live product data and stock state', async ({ page }) => {
    await mockApi(page, { product });
    await page.goto(`/product/${product.slug}`);

    await expect(page.getByRole('heading', { name: product.name }).first()).toBeVisible();
    await expect(page.getByText(/3 In Stock/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'BUY NOW' })).toBeEnabled();
  });

  test('redirects an unauthenticated add-to-cart attempt to login', async ({ page }) => {
    await mockApi(page, { product });
    await page.goto(`/product/${product.slug}`);
    await page.getByRole('button', { name: 'ADD TO CART' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('adds the selected quantity to the authenticated cart', async ({ page }) => {
    await seedAuthenticatedUser(page);
    await mockApi(page, { product });
    await page.goto(`/product/${product.slug}`);

    const quantity = page.locator('input[type="number"]').first();
    await quantity.fill('2');
    await quantity.blur();
    await page.getByRole('button', { name: 'ADD TO CART' }).click();

    await expect(page.getByText(/Added 2 x Executive Gift Box to Cart!/i)).toBeVisible();
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('giftery_cart_state')));
    expect(cart.items[0]).toMatchObject({ id: 'product-101', quantity: 2, price: 1200 });
  });

  test('clamps manually entered quantity to available stock', async ({ page }) => {
    await seedAuthenticatedUser(page);
    await mockApi(page, { product });
    await page.goto(`/product/${product.slug}`);

    const quantity = page.locator('input[type="number"]').first();
    await quantity.fill('10');
    await quantity.blur();
    await expect(quantity).toHaveValue('3');
  });

  test('disables purchase controls for an out-of-stock product', async ({ page }) => {
    await mockApi(page, { product: { ...product, stock: 0 } });
    await page.goto(`/product/${product.slug}`);

    await expect(page.getByRole('button', { name: 'OUT OF STOCK' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'BUY NOW' })).toBeDisabled();
  });
});