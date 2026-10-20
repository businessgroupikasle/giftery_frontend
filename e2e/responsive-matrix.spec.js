import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser } from './helpers/app.js';

const viewports = [
  { width: 320, height: 720 },
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const publicRoutes = [
  '/',
  '/corporate-gifts',
  '/personalized-gifts',
  '/toys',
  '/search?q=gift',
  '/product/responsive-test-gift',
  '/cart',
  '/wishlist',
  '/checkout',
  '/login',
  '/register',
  '/forgot-password',
  '/contact',
  '/about',
  '/faq',
  '/terms-and-conditions',
  '/privacy-policy',
  '/403',
  '/route-that-does-not-exist',
];

const product = {
  id: 'responsive-product',
  slug: 'responsive-test-gift',
  name: 'Responsive Test Gift With A Deliberately Long Product Name',
  price: 1299,
  stock: 12,
  images: ['/images/store-logo.png'],
  description: 'A test product used only by the mocked responsive browser suite.',
};

async function expectNoPageOverflow(page, route) {
  await expect(page.locator('#root')).toBeVisible();
  const result = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const overflowers = [...document.querySelectorAll('body *')]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.right > viewportWidth + 1 && style.position !== 'fixed';
      })
      .slice(0, 5)
      .map((element) => ({
        tag: element.tagName,
        className: String(element.className || '').slice(0, 100),
        right: Math.round(element.getBoundingClientRect().right),
      }));
    return {
      viewportWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflowers,
    };
  });

  expect(result, `${route} has horizontal overflow: ${JSON.stringify(result.overflowers)}`)
    .toMatchObject({ scrollWidth: result.viewportWidth });
}

test.describe('responsive viewport matrix', () => {
  for (const viewport of viewports) {
    test(`${viewport.width}x${viewport.height} storefront remains contained`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await mockApi(page, { products: [product], product });
      await page.goto('/corporate-gifts');
      await expectNoPageOverflow(page, '/corporate-gifts');

      if (viewport.width < 768) {
        const menuButton = page.getByRole('button', { name: 'Toggle mobile menu' });
        await expect(menuButton).toBeVisible();
        await menuButton.click();
        await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
        await expectNoPageOverflow(page, '/corporate-gifts (menu open)');
      }
    });
  }
});

test.describe('public route responsive sweep', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const route of publicRoutes) {
    test(`${route} has no page-level horizontal overflow`, async ({ page }) => {
      await mockApi(page, { products: [product], product });
      await page.goto(route);
      await expectNoPageOverflow(page, route);
    });
  }
});

test.describe('authenticated responsive routes', () => {
  for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    test(`account and dashboard at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await seedAuthenticatedUser(page, 'ADMIN');
      await mockApi(page, { products: [product], product });

      for (const route of ['/profile', '/orders', '/dashboard']) {
        await page.goto(route);
        await expectNoPageOverflow(page, route);
      }

      if (viewport.width <= 1024) {
        const toggle = page.getByRole('button', { name: 'Toggle dashboard navigation' });
        await expect(toggle).toBeVisible();
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(page.getByRole('button', { name: 'Close dashboard navigation' })).toBeVisible();
        await expectNoPageOverflow(page, '/dashboard (drawer open)');
      }
    });
  }
});
