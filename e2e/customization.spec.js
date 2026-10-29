import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser } from './helpers/app.js';

const product = {
  id: 'product-101', slug: 'custom-gift', name: 'Custom Gift', price: 1200,
  stock: 10, minOrder: 1, images: ['/images/about_hero_gift_set.png'],
  category: { id: 'cat-1', name: 'Corporate Gifts', slug: 'corporate-gifts' },
};

test('mobile editor keeps the product mockup and text overlay within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await seedAuthenticatedUser(page);
  await mockApi(page, { product });
  await page.route('**/api/v1/customizations/drafts/**', (route) => route.fulfill({ json: { data: null } }));
  await page.goto(`/product/${product.slug}`);

  const editor = page.getByRole('region', { name: 'Customize your gift ' });
  const mockup = editor.getByAltText('Selected product mockup');
  await expect(mockup).toHaveAttribute('src', product.images[0]);
  await expect.poll(() => mockup.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
  await editor.getByLabel('Personalized text').fill('Mobile gift');
  const overlay = editor.getByText('Mobile gift', { exact: true });
  await expect(overlay).toBeVisible();
  await overlay.scrollIntoViewIfNeeded();

  const imageBox = await mockup.boundingBox();
  const overlayBox = await overlay.boundingBox();
  expect(overlayBox.x).toBeGreaterThanOrEqual(imageBox.x);
  expect(overlayBox.x + overlayBox.width).toBeLessThanOrEqual(imageBox.x + imageBox.width);
  expect(overlayBox.y).toBeGreaterThanOrEqual(imageBox.y);
  expect(overlayBox.y + overlayBox.height).toBeLessThanOrEqual(imageBox.y + imageBox.height);

  for (const element of [editor, mockup, editor.getByLabel('Personalized text'), editor.getByRole('button', { name: 'Save draft' })]) {
    const box = await element.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(375);
  }
});

test('uploads artwork, saves and restores a positioned design, and sends it to cart', async ({ page }) => {
  await seedAuthenticatedUser(page);
  await mockApi(page, { product });

  let draft = null;
  let cartPayload;
  const requests = [];
  let uploads = 0;
  await page.route('**/api/v1/customizations/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    requests.push({ method: request.method(), path, authorization: request.headers().authorization });
    if (path.endsWith('/assets') && request.method() === 'POST') {
      uploads += 1;
      expect(request.headers()['content-type']).toContain('multipart/form-data');
      await route.fulfill({ json: { data: { id: uploads === 1 ? 'artwork-1' : 'preview-1' } } });
    } else if (path.endsWith('/assets/artwork-1')) {
      await route.fulfill({ path: 'public/images/about_hero_gift_set.png', contentType: 'image/png' });
    } else if (path.endsWith(`/drafts/${product.id}`) && request.method() === 'PUT') {
      draft = request.postDataJSON().design;
      await route.fulfill({ json: { data: { design: draft } } });
    } else if (path.endsWith(`/drafts/${product.id}`)) {
      await route.fulfill({ json: { data: draft ? { design: draft } : null } });
    } else {
      await route.fulfill({ status: 404, json: { message: 'Unexpected customization request' } });
    }
  });
  await page.route('**/api/v1/cart', async (route) => {
    if (route.request().method() === 'POST') {
      cartPayload = route.request().postDataJSON();
      requests.push({ method: 'POST', path: '/cart', authorization: route.request().headers().authorization });
      await route.fulfill({ json: { data: { cart: { items: [{ id: 'line-1', product, quantity: cartPayload.quantity, customization: cartPayload.customization }] } } } });
    } else {
      await route.fulfill({ json: { data: { cart: { items: [] } } } });
    }
  });

  await page.goto(`/product/${product.slug}`);
  const editor = page.getByRole('region', { name: 'Customize your gift ' });
  await expect(editor.getByAltText('Selected product mockup')).toHaveAttribute('src', product.images[0]);
  await expect(editor.getByAltText('Selected product mockup')).toHaveJSProperty('complete', true);
  expect(await editor.getByAltText('Selected product mockup').evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
  await editor.locator('input[type=file]').setInputFiles('public/images/about_hero_gift_set.png');
  await expect(editor.getByAltText('Your artwork')).toBeVisible();
  await editor.getByLabel(/Horizontal position/).fill('35');
  await editor.getByLabel('Personalized text').fill('Happy birthday');
  await expect(editor.getByRole('button', { name: 'Add saved design to cart' })).toBeDisabled();
  await editor.getByRole('button', { name: 'Text', exact: true }).click();
  await editor.getByLabel(/Vertical position/).fill('75');
  await expect(editor.getByText('Happy birthday', { exact: true })).toHaveCSS('top', /px/);

  await page.getByRole('button', { name: 'ADD TO CART' }).click();
  await expect(page.getByText('Save your customization before adding it to the cart.')).toBeVisible();
  expect(cartPayload).toBeUndefined();
  await editor.getByRole('button', { name: 'Save draft' }).click();
  await expect(editor.getByRole('status')).toHaveText('Draft saved.');
  expect(draft).toMatchObject({ productImage: product.images[0], imageAssetId: 'artwork-1', previewAssetId: 'preview-1', image: { x: 35 }, text: { value: 'Happy birthday', y: 75 } });
  expect(uploads).toBe(2);

  await page.reload();
  await expect(editor.getByRole('status')).toHaveText('Saved draft restored.');
  await expect(editor.getByLabel('Personalized text')).toHaveValue('Happy birthday');
  await expect(editor.getByAltText('Your artwork')).toBeVisible();
  await expect(editor.getByLabel(/Vertical position/)).toHaveValue('75');
  await editor.getByRole('button', { name: 'Add saved design to cart' }).click();
  await expect.poll(() => cartPayload).toMatchObject({ productId: product.id, quantity: 1, customization: draft });
  await expect(page.getByText(/Added 1 x Custom Gift to Cart!/)).toBeVisible();
  expect(requests.length).toBeGreaterThan(4);
  expect(requests.every((request) => request.authorization === 'Bearer test-access-token')).toBe(true);
});
