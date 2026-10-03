import { test, expect } from '@playwright/test';
import { mockApi } from './helpers/app.js';

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`about CTA uses the corporate gift background on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await mockApi(page);
    await page.goto('/about');

    const heading = page.getByRole('heading', { name: 'Ready to Elevate Your Corporate Gifting?' });
    const section = heading.locator('xpath=ancestor::section');
    await heading.scrollIntoViewIfNeeded();

    await expect(heading).toBeVisible();
    await expect(section.getByRole('link', { name: /request a custom quote/i })).toBeVisible();
    await expect(section).toHaveCSS('background-image', /corporate_gifting_banner\.png/);
    await expect(section).toHaveCSS('background-size', /cover/);
  });
}
