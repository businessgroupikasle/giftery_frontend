import { test, expect } from '@playwright/test';
import { mockApi } from './helpers/app.js';

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900, maxCtaHeight: 270, background: /corporate_gifting_banner1\.webp/ },
  { name: 'mobile', width: 390, height: 844, maxCtaHeight: 240, background: /corporate_gifting_banner\.webp/ },
]) {
  test(`about CTA stays compact with a corporate gift background on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await mockApi(page);
    await page.goto('/about');

    const heading = page.getByRole('heading', { name: 'Ready to Elevate Your Corporate Gifting?' });
    const section = heading.locator('xpath=ancestor::section');
    await heading.scrollIntoViewIfNeeded();

    await expect(heading).toBeVisible();
    const quoteLink = section.getByRole('link', { name: /request a custom quote/i });
    await expect(quoteLink).toBeVisible();
    await expect(quoteLink).toHaveAttribute('href', '/contact');
    await expect(section).toHaveCSS('background-image', viewport.background);
    await expect(section).toHaveCSS('background-size', /cover/);
    const sectionBox = await section.boundingBox();
    const linkBox = await quoteLink.boundingBox();
    expect(sectionBox.height).toBeLessThanOrEqual(viewport.maxCtaHeight);
    expect(linkBox.height).toBeGreaterThanOrEqual(44);
  });
}
