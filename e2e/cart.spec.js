import { test, expect } from '@playwright/test';
import { mockApi, seedStorage } from './helpers/app.js';

test.describe('Cart and checkout guards', () => {
  test('shows the empty cart state', async ({ page }) => {
    await mockApi(page);
    await page.goto('/cart');

    await expect(page.getByRole('heading', { name: 'Your Cart is Empty' })).toBeVisible();
    await expect(page.getByRole('link', { name: /explore products/i })).toBeVisible();
  });

  test('loads a persisted cart and updates quantity', async ({ page }) => {
    await seedStorage(page, {
      giftery_cart_state: {
        items: [{
          id: 'product-1',
          productId: 'product-1',
          name: 'Executive Gift Box',
          price: 1200,
          quantity: 1,
          image: '/placeholder-product.png',
          maxStock: 5,
        }],
        totalQuantity: 1,
        totalPrice: 1200,
      },
    });
    await mockApi(page);
    await page.goto('/cart');

    await expect(page.getByRole('heading', { name: 'Executive Gift Box' })).toBeVisible();
    const itemRow = page.getByRole('heading', { name: 'Executive Gift Box' }).locator('xpath=ancestor::div[contains(@class,"cartItemRow")]');
    await itemRow.getByRole('button', { name: '+' }).click();
    await expect(itemRow).toContainText('2');
  });

  test('clears all persisted cart items', async ({ page }) => {
    await seedStorage(page, {
      giftery_cart_state: {
        items: [{ id: 'product-1', name: 'Gift Box', price: 500, quantity: 1 }],
        totalQuantity: 1,
        totalPrice: 500,
      },
    });
    await mockApi(page);
    await page.goto('/cart');
    await page.getByRole('button', { name: /clear cart/i }).click();

    await expect(page.getByRole('heading', { name: 'Your Cart is Empty' })).toBeVisible();
  });

  test('redirects an empty checkout back to cart', async ({ page }) => {
    await mockApi(page);
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole('heading', { name: 'Your Cart is Empty' })).toBeVisible();
  });
});