import { test, expect } from '@playwright/test';
import { mockApi } from './helpers/app.js';

test('public SEO URLs use gifterys.com on every route', async ({ page }) => {
  await mockApi(page);

  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://gifterys.com/');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://gifterys.com/');

  await page.goto('/about?source=test');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://gifterys.com/about');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://gifterys.com/about');
});
