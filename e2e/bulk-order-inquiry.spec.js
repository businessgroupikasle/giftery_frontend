import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser } from './helpers/app.js';

const product = {
  id: 'product-bulk-1',
  slug: 'steel-water-bottle',
  name: 'Steel Water Bottle',
  sku: 'SWB-750',
  price: 650,
  comparePrice: 800,
  stock: 40,
  minOrder: 1,
  description: 'Insulated bottle.',
  images: ['/placeholder-product.png'],
  category: { id: 'cat-1', name: 'Drinkware', slug: 'drinkware' },
};

const BULK_URL = '**/api/v1/enquiries/bulk-order';
const SUCCESS = 'Your bulk order inquiry has been submitted successfully! Our team will contact you shortly to discuss your bulk order and the 10% offer eligibility.';

const bulkSection = (page) => page.locator('#bulk-order');
const openBulkForm = async (page) => {
  await page.getByRole('button', { name: /Bulk Order Inquiry/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
};

const fillValidForm = async (page) => {
  const form = bulkSection(page);
  await form.getByLabel(/Required Quantity/).fill('250');
  await form.getByLabel(/Full Name/).fill('Priya Raman');
  await form.getByLabel('Phone number').fill('9876543210');
  await form.getByLabel(/Email Address/).fill('priya@example.com');
  await form.getByLabel(/Company/).fill('Acme Ltd');
  await form.getByLabel(/Additional Requirements/).fill('Logo on each bottle');
};

test.describe('Bulk order inquiry on the product page', () => {
  test('shows the 10% offer banner directly above a form linked to the product', async ({ page }) => {
    await mockApi(page, { product });
    await page.goto(`/product/${product.slug}`);
    await openBulkForm(page);

    const section = bulkSection(page);
    await expect(section.getByText('Special Bulk Order Offer')).toBeVisible();
    await expect(section.getByText('GET 10% OFF')).toBeVisible();
    await expect(section.getByText('Order in bulk and save 10% on your purchase!')).toBeVisible();
    await expect(section.getByText(/not applied automatically to cart or checkout prices/)).toBeVisible();

    const bannerBox = await section.getByText('GET 10% OFF').boundingBox();
    const formBox = await section.getByRole('heading', { name: /Bulk Order Inquiry/ }).boundingBox();
    expect(bannerBox.y).toBeLessThan(formBox.y);

    await expect(section.getByLabel('Product Name')).toHaveValue(product.name);
    await expect(section.getByLabel('Product Name')).toHaveAttribute('readonly', '');
    await expect(section.getByLabel('SKU')).toHaveValue(product.sku);
    await expect(section.getByLabel('SKU')).toHaveAttribute('readonly', '');

    // Regular purchase price is untouched by the offer.
    await expect(page.getByText(/₹\s?650/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' })).toBeEnabled();
  });

  test('shows inline errors and sends nothing while the form is invalid', async ({ page }) => {
    await mockApi(page, { product });
    let requests = 0;
    await page.route(BULK_URL, (route) => { requests += 1; return route.fulfill({ status: 201, json: { data: {} } }); });
    await page.goto(`/product/${product.slug}`);
    await openBulkForm(page);

    const section = bulkSection(page);
    await section.getByRole('button', { name: 'Submit Bulk Order Inquiry' }).click();
    await expect(section.getByText('Please enter the quantity you need.')).toBeVisible();
    await expect(section.getByText('Please enter your full name.')).toBeVisible();
    await expect(section.getByText('Please enter your mobile number.')).toBeVisible();
    await expect(section.getByText('Please enter your email address.')).toBeVisible();
    await expect(section.getByLabel(/Required Quantity/)).toBeFocused();

    await section.getByLabel(/Required Quantity/).fill('2.5');
    await section.getByLabel(/Email Address/).fill('priya@');
    await section.getByRole('button', { name: 'Submit Bulk Order Inquiry' }).click();
    await expect(section.getByText('Quantity must be a whole number, like 100.')).toBeVisible();
    await expect(section.getByText('Please enter a valid email address.')).toBeVisible();

    await section.getByLabel(/Required Quantity/).fill('99');
    await section.getByLabel(/Required Quantity/).blur();
    await expect(section.getByText('Minimum bulk order is 100 units.')).toBeVisible();
    await expect(section.getByText('Minimum order: 100 units')).toBeVisible();
    await expect(page.getByText(/Get 10% OFF on bulk orders of 100\+ units/)).toBeVisible();
    expect(requests).toBe(0);
  });

  test('submits once, links the product and shows the success message', async ({ page }) => {
    await mockApi(page, { product });
    const bodies = [];
    await page.route(BULK_URL, async (route) => {
      bodies.push(route.request().postDataJSON());
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.fulfill({ status: 201, json: { success: true, data: { id: 'ENQ-2026-0042', productId: product.id, quantity: 250 } } });
    });
    await page.goto(`/product/${product.slug}`);
    await openBulkForm(page);
    await fillValidForm(page);

    const submit = bulkSection(page).getByRole('button', { name: 'Submit Bulk Order Inquiry' });
    await submit.click();
    await expect(bulkSection(page).getByRole('button', { name: /Submitting inquiry/ })).toBeDisabled();
    await bulkSection(page).locator('form').evaluate((form) => form.requestSubmit());

    await expect(bulkSection(page).getByText(SUCCESS)).toBeVisible();
    await expect(bulkSection(page).getByText('ENQ-2026-0042')).toBeVisible();
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toEqual({
      productId: product.id,
      quantity: 250,
      name: 'Priya Raman',
      email: 'priya@example.com',
      phone: '+919876543210',
      company: 'Acme Ltd',
      requirements: 'Logo on each bottle',
    });
  });

  test('keeps everything the customer typed when submission fails', async ({ page }) => {
    await mockApi(page, { product });
    let attempts = 0;
    await page.route(BULK_URL, (route) => {
      attempts += 1;
      return attempts === 1
        ? route.fulfill({ status: 500, json: { success: false, message: 'Internal error' } })
        : route.fulfill({ status: 201, json: { success: true, data: { id: 'ENQ-2026-0043' } } });
    });
    await page.goto(`/product/${product.slug}`);
    await openBulkForm(page);
    await fillValidForm(page);
    const section = bulkSection(page);
    await section.getByRole('button', { name: 'Submit Bulk Order Inquiry' }).click();

    await expect(section.getByRole('alert')).toContainText('your inquiry was not sent');
    await expect(section.getByLabel(/Required Quantity/)).toHaveValue('250');
    await expect(section.getByLabel(/Full Name/)).toHaveValue('Priya Raman');
    await expect(section.getByLabel('Phone number')).toHaveValue('9876543210');
    await expect(section.getByLabel(/Email Address/)).toHaveValue('priya@example.com');
    await expect(section.getByLabel(/Company/)).toHaveValue('Acme Ltd');
    await expect(section.getByLabel(/Additional Requirements/)).toHaveValue('Logo on each bottle');

    await section.getByRole('button', { name: 'Submit Bulk Order Inquiry' }).click();
    await expect(section.getByText(SUCCESS)).toBeVisible();
  });

  test('shows the server message for a repeat inquiry', async ({ page }) => {
    await mockApi(page, { product });
    await page.route(BULK_URL, (route) => route.fulfill({
      status: 409,
      json: { success: false, message: 'You have already submitted a bulk inquiry for this product (ENQ-2026-0042). Our team will contact you shortly.' },
    }));
    await page.goto(`/product/${product.slug}`);
    await openBulkForm(page);
    await fillValidForm(page);
    await bulkSection(page).getByRole('button', { name: 'Submit Bulk Order Inquiry' }).click();
    await expect(bulkSection(page).getByRole('alert')).toContainText('already submitted a bulk inquiry');
  });

  test('fills in the signed-in customer and hides SKU when the product has none', async ({ page }) => {
    await seedAuthenticatedUser(page);
    await mockApi(page, { product: { ...product, sku: null } });
    await page.goto(`/product/${product.slug}`);
    await openBulkForm(page);
    const section = bulkSection(page);
    await expect(section.getByLabel(/Full Name/)).toHaveValue('Test User');
    await expect(section.getByLabel(/Email Address/)).toHaveValue('test@example.com');
    await expect(section.getByLabel('SKU')).toHaveCount(0);
  });

  test('fits a phone screen without horizontal scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mockApi(page, { product });
    await page.goto(`/product/${product.slug}`);
    await openBulkForm(page);
    const section = bulkSection(page);
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByText('GET 10% OFF')).toBeVisible();
    const box = await section.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(375);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });

  test('the offer appears only on the product page', async ({ page }) => {
    await mockApi(page, { product, products: [product] });
    for (const path of ['/', '/shop', '/cart']) {
      await page.goto(path);
      await expect(page.locator('#bulk-order')).toHaveCount(0);
      await expect(page.getByText('Special Bulk Order Offer')).toHaveCount(0);
    }
  });

  test('the offer sits inside the product card, above Add to Cart, with the form hidden until opened', async ({ page }) => {
    await mockApi(page, { product });
    await page.goto(`/product/${product.slug}`);

    const opener = page.getByRole('button', { name: /Bulk Order Inquiry/ });
    await expect(page.getByText(/Get 10% OFF on bulk orders/)).toBeVisible();
    await expect(page.getByRole('dialog')).toBeHidden();
    const openerBox = await opener.boundingBox();
    const quantityBox = await page.locator('input[type="number"]').first().boundingBox();
    const cartBox = await page.getByRole('button', { name: 'ADD TO CART' }).boundingBox();
    expect(openerBox.y).toBeGreaterThan(quantityBox.y);
    expect(openerBox.y).toBeLessThan(cartBox.y);

    await opener.click();
    await expect(page.getByRole('dialog', { name: /Bulk Order Inquiry/ })).toBeVisible();
  });

  test('closing the popup keeps what was typed and returns focus', async ({ page }) => {
    await mockApi(page, { product });
    await page.goto(`/product/${product.slug}`);
    await openBulkForm(page);
    await bulkSection(page).getByLabel(/Required Quantity/).fill('300');
    await bulkSection(page).getByLabel(/Full Name/).fill('Priya Raman');

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByRole('button', { name: /Bulk Order Inquiry/ })).toBeFocused();

    await openBulkForm(page);
    await expect(bulkSection(page).getByLabel(/Required Quantity/)).toHaveValue('300');
    await expect(bulkSection(page).getByLabel(/Full Name/)).toHaveValue('Priya Raman');

    await page.getByRole('button', { name: 'Close bulk order inquiry' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});
