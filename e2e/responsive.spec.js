import { test, expect } from '@playwright/test';
import { mockApi } from './helpers/app.js';

test.describe('Responsive storefront UI', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens mobile navigation and keeps the page within the viewport', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: 'Toggle mobile menu' });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation').last()).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('mobile cart remains usable with a persisted item', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('giftery_cart_state', JSON.stringify({
      items: [{ id: 'p1', name: 'Mobile Gift', price: 750, quantity: 1, maxStock: 3 }],
      totalQuantity: 1,
      totalPrice: 750,
    })));
    await mockApi(page);
    await page.goto('/cart');

    await expect(page.getByRole('heading', { name: 'Mobile Gift' })).toBeVisible();
    await expect(page.getByRole('button', { name: /proceed to checkout/i })).toBeVisible();
  });
});