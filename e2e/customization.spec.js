// Mock-API UI checks that run without a backend. The full flow is in customization-live.spec.js.
import { Buffer } from 'node:buffer';
import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser } from './helpers/app.js';

const images = ['/images/about_hero_gift_set.png', '/images/product-placeholder.svg'];
const product = {
  id: 'product-101', slug: 'custom-gift', name: 'Custom Gift', price: 1200,
  stock: 10, minOrder: 1, images,
  category: { id: 'cat-1', name: 'Corporate Gifts', slug: 'corporate-gifts' },
};
const emptyDesigns = { success: true, data: { data: [], meta: {} } };

const mockStudio = async (page, overrides = {}) => {
  await page.route('**/api/v1/customizations/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();
    if (overrides[path]) { await overrides[path](route); return; }
    if (path.endsWith('/customizations/assets')) { await route.fulfill({ json: { success: true, data: [] } }); return; }
    if (path.endsWith('/customizations/designs') && method === 'GET') { await route.fulfill({ json: emptyDesigns }); return; }
    if (path.endsWith('/customizations/designs') && method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { success: true, data: { id: 'design-1', revision: 1, status: 'DRAFT', ...body } } });
      return;
    }
    await route.fulfill({ status: 404, json: { message: 'Not found' } });
  });
};

test('guests see the entry point and are sent to sign in, not the editor', async ({ page }) => {
  await mockApi(page, { product });
  await page.goto(`/product/${product.slug}`);
  await expect(page.getByRole('heading', { name: 'Customize This Product' })).toBeVisible();
  await expect(page.getByLabel('Your text')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start Customizing' }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByTestId('design-stage')).toHaveCount(0);
});

test('guests opening a studio link directly are sent to sign in', async ({ page }) => {
  await mockApi(page, { product });
  await page.goto(`/customize/${product.slug}?design=someone-elses-design`);
  await expect(page).toHaveURL(/\/login/);
});

test('ordinary purchasing does not depend on the customization service', async ({ page }) => {
  await seedAuthenticatedUser(page);
  await mockApi(page, { product });
  await page.route('**/api/v1/customizations/**', (route) => route.fulfill({ status: 500, json: { message: 'Unavailable' } }));
  await page.goto(`/product/${product.slug}`);
  await expect(page.getByRole('button', { name: 'ADD TO CART' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'BUY NOW' })).toBeEnabled();
  await page.getByRole('button', { name: 'BUY NOW' }).click();
  await expect(page).toHaveURL(/\/checkout/);
});

test('products with customization turned off show no entry point', async ({ page }) => {
  await mockApi(page, { product: { ...product, customizationConfig: { enabled: false } } });
  await page.goto(`/product/${product.slug}`);
  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start Customizing' })).toHaveCount(0);
});

test('the editor stays within a phone screen and keeps the mockup notice visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedAuthenticatedUser(page);
  await mockApi(page, { product });
  await mockStudio(page);
  await page.goto(`/customize/${product.slug}?step=text`);
  await page.getByRole('button', { name: '+ Name' }).click();
  await expect(page.locator('[data-element-type="text"]')).toBeVisible();
  await expect(page.getByText(/Visual mockup only/)).toBeVisible();
  const stage = await page.getByTestId('design-stage').boundingBox();
  expect(stage.x).toBeGreaterThanOrEqual(0);
  expect(stage.x + stage.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('fonts apply on the mockup and undo restores the previous one', async ({ page }) => {
  await seedAuthenticatedUser(page);
  await mockApi(page, { product });
  await mockStudio(page);
  await page.goto(`/customize/${product.slug}?step=text`);
  await page.getByRole('button', { name: '+ Name' }).click();
  const text = page.locator('[data-element-type="text"] div div');
  await page.locator('[data-testid="properties-panel"] select').selectOption('Georgia');
  await expect(text).toHaveCSS('font-family', /Georgia/);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(text).toHaveCSS('font-family', /Montserrat/);
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(text).toHaveCSS('font-family', /Georgia/);
});

test('autosave failures are reported and the work stays on screen', async ({ page }) => {
  await seedAuthenticatedUser(page);
  await mockApi(page, { product });
  await mockStudio(page, { '/api/v1/customizations/designs': (route) => (route.request().method() === 'POST'
    ? route.fulfill({ status: 500, json: { message: 'Could not store the design' } })
    : route.fulfill({ json: emptyDesigns })) });
  await page.goto(`/customize/${product.slug}?step=text`);
  await page.getByRole('button', { name: '+ Name' }).click();
  await expect(page.getByTestId('save-status')).toHaveText(/Could not save/);
  await expect(page.getByText('Could not store the design').first()).toBeVisible();
  await expect(page.locator('[data-element-type="text"]')).toBeVisible();
});

test('a design from elsewhere that cannot be loaded shows a recoverable message', async ({ page }) => {
  await seedAuthenticatedUser(page);
  await mockApi(page, { product });
  await mockStudio(page);
  await page.goto(`/customize/${product.slug}?design=missing`);
  await expect(page.getByRole('alert')).toContainText('could not be found');
  await expect(page.getByRole('link', { name: 'Back to product' })).toBeVisible();
  await expect(page.getByTestId('design-stage')).toHaveCount(0);
});

test('unsupported files are rejected before upload', async ({ page }) => {
  await seedAuthenticatedUser(page);
  await mockApi(page, { product });
  let uploads = 0;
  await mockStudio(page, { '/api/v1/customizations/assets': (route) => {
    if (route.request().method() === 'POST') uploads += 1;
    return route.fulfill({ json: { success: true, data: [] } });
  } });
  await page.goto(`/customize/${product.slug}?step=logo`);
  await page.getByLabel('Choose logos or drag them here').setInputFiles({ name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF') });
  await expect(page.getByText(/choose a PNG, JPG, JPEG or SVG file/)).toBeVisible();
  await page.getByLabel('Choose logos or drag them here').setInputFiles({ name: 'huge.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
  await expect(page.getByText(/must be 5 MB or smaller/)).toBeVisible();
  expect(uploads).toBe(0);
});
