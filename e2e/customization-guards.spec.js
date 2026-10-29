import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser } from './helpers/app.js';

const product = { id: 'guard-product', slug: 'guard-product', name: 'Guard Gift', price: 100, stock: 5, minOrder: 1, images: ['/images/about_hero_gift_set.png'], category: { id: 'cat-1', name: 'Corporate Gifts', slug: 'corporate-gifts' } };
const related = { id: 'related', slug: 'related', name: 'Related Gift', price: 50, images: product.images, category: product.category };
const design = (value) => ({ version: 1, productImage: product.images[0], imageAssetId: null, image: { x: 50, y: 45, width: 30, rotation: 0 }, text: { value, color: '#111111', x: 50, y: 65, width: 40, rotation: 0 } });

test('guests cannot edit and are directed to sign in', async ({ page }) => {
  await mockApi(page, { product });
  await page.goto(`/product/${product.slug}`);
  await expect(page.getByLabel('Personalized text')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign in to personalize' }).click();
  await expect(page).toHaveURL(/\/login/);
});

test('draft load failure blocks purchase until retry and account change resets the editor', async ({ page }) => {
  await seedAuthenticatedUser(page);
  await mockApi(page, { product });
  let calls = 0;
  let release;
  const waiting = new Promise((resolve) => { release = resolve; });
  await page.route('**/api/v1/customizations/drafts/**', async (route) => {
    calls += 1;
    if (calls === 1) { await waiting; await route.fulfill({ status: 400, json: { message: 'Draft unavailable' } }); }
    else await route.fulfill({ json: { data: calls === 2 ? { design: design('Private first account') } : null } });
  });
  await page.goto(`/product/${product.slug}`);
  const add = page.getByRole('button', { name: 'ADD TO CART' });
  const buy = page.getByRole('button', { name: 'BUY NOW' });
  await expect(add).toBeDisabled();
  await expect(buy).toBeDisabled();
  release();
  await expect(page.getByRole('status').filter({ hasText: 'Could not load draft' })).toBeVisible();
  await expect(add).toBeDisabled();
  await page.getByRole('button', { name: 'Retry loading draft' }).click();
  await expect(page.getByLabel('Personalized text')).toHaveValue('Private first account');
  await expect(add).toBeEnabled();
  await page.getByLabel('Personalized text').evaluate((element) => {
    let fiber = element[Object.keys(element).find((key) => key.startsWith('__reactFiber$'))];
    while (fiber && !fiber.memoizedProps?.store) fiber = fiber.return;
    const store = fiber.memoizedProps.store;
    localStorage.setItem('ec_access_token', 'other-token');
    store.dispatch({ type: 'auth/setCredentials', payload: { token: 'other-token', user: { id: 'user-2', name: 'Other' } } });
  });
  await expect(page.getByLabel('Personalized text')).toHaveValue('');
  await expect(page.getByText('Private first account')).toHaveCount(0);
  await expect.poll(() => calls).toBe(3);
});

test('malformed drafts show a recoverable error and preserve the selected image', async ({ page }) => {
  const galleryProduct = { ...product, images: [product.images[0], '/images/product-placeholder.svg'] };
  await seedAuthenticatedUser(page);
  await mockApi(page, { product: galleryProduct });
  let calls = 0;
  await page.route('**/api/v1/customizations/drafts/**', async (route) => {
    calls += 1;
    await route.fulfill({ json: { data: { design: calls === 1 ? { text: null } : design('Recovered') } } });
  });
  await page.goto(`/product/${product.slug}`);
  await expect(page.getByRole('status').filter({ hasText: 'Could not load draft' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save draft' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'ADD TO CART' })).toBeDisabled();
  await page.getByRole('button', { name: `${product.name} thumb 2` }).click();
  await page.getByRole('button', { name: 'Retry loading draft' }).click();
  await expect(page.getByLabel('Personalized text')).toHaveValue('Recovered');
  await expect(page.getByAltText('Selected product mockup')).toHaveAttribute('src', /product-placeholder\.svg/);
  await expect(page.getByRole('status').filter({ hasText: 'Unsaved changes' })).toBeVisible();
});

test('gallery changes during draft loading do not skip the saved design', async ({ page }) => {
  const galleryProduct = { ...product, images: [product.images[0], '/images/product-placeholder.svg'] };
  await seedAuthenticatedUser(page);
  await mockApi(page, { product: galleryProduct });
  let release;
  const waiting = new Promise((resolve) => { release = resolve; });
  await page.route('**/api/v1/customizations/drafts/**', async (route) => {
    await waiting;
    await route.fulfill({ json: { data: { design: design('Saved design') } } });
  });
  await page.goto(`/product/${product.slug}`);
  await page.getByRole('button', { name: `${product.name} thumb 2` }).click();
  release();
  await expect(page.getByLabel('Personalized text')).toHaveValue('Saved design');
  await expect(page.getByAltText('Selected product mockup')).toHaveAttribute('src', /product-placeholder\.svg/);
  await expect(page.getByRole('status').filter({ hasText: 'Unsaved changes' })).toBeVisible();
});

test('upload and save failures block purchase, with discard recovery', async ({ page }) => {
  await seedAuthenticatedUser(page);
  await mockApi(page, { product });
  let release;
  const waiting = new Promise((resolve) => { release = resolve; });
  let releaseSave;
  const waitingSave = new Promise((resolve) => { releaseSave = resolve; });
  let uploads = 0;
  await page.route('**/api/v1/customizations/**', async (route) => {
    if (route.request().method() === 'POST') { uploads += 1; await (uploads === 1 ? waiting : waitingSave); await route.fulfill({ status: 400, json: { message: 'Upload unavailable' } }); }
    else await route.fulfill({ json: { data: null } });
  });
  await page.goto(`/product/${product.slug}`);
  const add = page.getByRole('button', { name: 'ADD TO CART' });
  await expect(add).toBeEnabled();
  await page.locator('input[type=file]').setInputFiles('public/images/about_hero_gift_set.png');
  await expect(add).toBeDisabled();
  await expect(page.getByRole('button', { name: 'BUY NOW' })).toBeDisabled();
  release();
  await expect(page.getByRole('status').filter({ hasText: 'Artwork upload failed' })).toBeVisible();
  await expect(add).toBeDisabled();
  await page.getByRole('button', { name: 'Discard customization' }).click();
  await expect(add).toBeEnabled();
  await page.getByLabel('Personalized text').fill('Test');
  await page.getByRole('button', { name: 'Save draft' }).click();
  await expect.poll(() => uploads).toBe(2);
  await expect(add).toBeDisabled();
  await expect(page.getByRole('button', { name: 'BUY NOW' })).toBeDisabled();
  releaseSave();
  await expect(page.getByRole('status').filter({ hasText: 'Draft not saved' })).toBeVisible();
  await expect(add).toBeDisabled();
});

test('ordinary and related cart failures do not show success', async ({ page }) => {
  await seedAuthenticatedUser(page);
  await mockApi(page, { product, products: [product, related] });
  await page.route('**/api/v1/customizations/drafts/**', (route) => route.fulfill({ json: { data: null } }));
  await page.route('**/api/v1/cart', async (route) => {
    if (route.request().method() === 'POST') await route.fulfill({ status: 400, json: { message: 'Cart unavailable' } });
    else await route.fulfill({ json: { data: { cart: { items: [] } } } });
  });
  await page.goto(`/product/${product.slug}`);
  await page.getByRole('button', { name: 'ADD TO CART' }).click();
  await expect(page.getByText('Cart unavailable').first()).toBeVisible();
  await expect(page.getByText(/Added 1 x Guard Gift/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Add Related Gift to cart' }).click();
  await expect(page.getByText('Added Related Gift', { exact: true })).toHaveCount(0);
});
