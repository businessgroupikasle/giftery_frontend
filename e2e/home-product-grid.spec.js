import { test, expect } from '@playwright/test';
import { mockApi } from './helpers/app.js';

test('home featured-product cards keep equal widths with different image dimensions', async ({ page }) => {
  const products = [
    {
      id: 'small-image-product', slug: 'small-image-product', name: 'Machine Gun',
      description: 'A featured product with a compact source image.', price: 549,
      images: ['/images/store-logo.png'], featured: true,
    },
    {
      id: 'large-image-product', slug: 'large-image-product', name: 'Radha Krishna Wall Hanging',
      description: 'A featured product with a much larger source image and longer description.', price: 699,
      images: ['/images/personalized-gifts-banner.png'], featured: true,
    },
  ];

  await page.setViewportSize({ width: 1024, height: 900 });
  await mockApi(page, { products });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const firstCard = page.getByRole('heading', { name: products[0].name }).locator('xpath=../..');
  const secondCard = page.getByRole('heading', { name: products[1].name }).locator('xpath=../..');
  await expect(firstCard).toBeVisible();
  await expect(secondCard).toBeVisible();

  const firstBox = await firstCard.boundingBox();
  const secondBox = await secondCard.boundingBox();
  expect(Math.abs(firstBox.width - secondBox.width)).toBeLessThanOrEqual(1);
});
