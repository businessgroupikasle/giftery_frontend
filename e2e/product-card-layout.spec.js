import { test, expect } from '@playwright/test';
import { mockApi } from './helpers/app.js';

const products = [
  { id: 'p1', slug: 'wooden-plaque', name: 'Engraved Wooden Memory Plaque', price: 1599, comparePrice: 1899, stock: 10, categoryId: 'personalized' },
  { id: 'p2', slug: 'couple-caricature', name: 'Custom Couple Caricature Stand', price: 1299, stock: 10, categoryId: 'personalized' },
  { id: 'p3', slug: 'photo-frame', name: 'Personalized Family Photo Frame', price: 999, comparePrice: 1299, stock: 10, categoryId: 'personalized' },
];

test('product purchase controls remain inside their cards', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockApi(page, { products });
  await page.route('**/api/v1/categories**', (route) => route.fulfill({
    json: { categories: [{ id: 'personalized', name: 'Personalized Gifts', slug: 'personalized-gifts', parentId: null }] },
  }));
  await page.goto('/personalized-gifts', { waitUntil: 'domcontentloaded' });

  for (const product of products) {
    const card = page.getByRole('article', { name: product.name });
    await expect(card).toBeVisible();

    const cardBox = await card.boundingBox();
    const controls = [
      card.getByRole('button', { name: /add to cart/i }),
      card.getByRole('button', { name: /buy now/i }),
      card.getByRole('button', { name: /more options/i }),
    ];

    for (const control of controls) {
      await expect(control).toBeVisible();
      const controlBox = await control.boundingBox();
      expect(controlBox.x).toBeGreaterThanOrEqual(cardBox.x);
      expect(controlBox.x + controlBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1);
    }
  }
});
