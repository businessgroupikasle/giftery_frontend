import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser } from './helpers/app.js';

const product = {
  id: 'font-product', slug: 'font-product', name: 'Font Gift', price: 100,
  stock: 5, minOrder: 1, images: ['/images/about_hero_gift_set.png'],
  category: { id: 'cat-1', name: 'Corporate Gifts', slug: 'corporate-gifts' },
};

test('restores legacy text and independently saves and exports font and size', async ({ page }) => {
  await seedAuthenticatedUser(page);
  await mockApi(page, { product });
  await page.addInitScript(() => {
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      window.previewFont = this.font;
      return fillText.apply(this, args);
    };
  });
  let draft = {
    version: 1, productImage: product.images[0], imageAssetId: null,
    image: { x: 50, y: 45, width: 30, rotation: 0 },
    text: { value: 'Hello', color: '#111111', x: 50, y: 65, width: 40, rotation: 0 },
  };
  await page.route('**/api/v1/customizations/**', async (route) => {
    if (route.request().url().endsWith('/assets')) {
      await route.fulfill({ json: { data: { id: 'preview-1' } } });
    } else if (route.request().method() === 'PUT') {
      draft = route.request().postDataJSON().design;
      await route.fulfill({ json: { data: { design: draft } } });
    } else {
      await route.fulfill({ json: { data: { design: draft } } });
    }
  });
  await page.goto(`/product/${product.slug}`);
  const editor = page.getByRole('region', { name: 'Customize your gift ' });
  await expect(editor.getByRole('status')).toHaveText('Saved draft restored.');
  await expect(editor.getByRole('combobox', { name: 'Font' })).toHaveValue('Arial');
  await expect(editor.getByLabel(/Text size:/)).toHaveValue('5');
  await editor.getByLabel(/Text box width:/).fill('60');
  await expect(editor.getByLabel(/Text size:/)).toHaveValue('5');
  await editor.getByRole('combobox', { name: 'Font' }).selectOption('Georgia');
  await editor.getByLabel(/Text size:/).fill('8');
  await expect(editor.getByText('Hello', { exact: true })).toHaveCSS('font-family', 'Georgia');
  await editor.getByRole('button', { name: 'Save draft' }).click();
  await expect(editor.getByRole('status')).toHaveText('Draft saved.');
  expect(draft.text).toMatchObject({ font: 'Georgia', fontSize: 8, width: 60 });
  expect(await page.evaluate(() => window.previewFont)).toMatch(/^(bold|700) 80px Georgia$/);
  await page.reload();
  await expect(editor.getByRole('combobox', { name: 'Font' })).toHaveValue('Georgia');
  await expect(editor.getByLabel(/Text size:/)).toHaveValue('8');
});
