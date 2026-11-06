import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser, seedCart } from './helpers/app.js';

const product = {
  id: 'product-101', slug: 'quote-gift', name: 'Quote Gift', price: 1200, stock: 10, minOrder: 1,
  images: ['/images/about_hero_gift_set.png'],
  category: { id: 'cat-1', name: 'Corporate Gifts', slug: 'corporate-gifts' },
};

const captureEnquiries = async (page) => {
  const enquiries = [];
  await page.route('**/api/v1/enquiries', async (route) => {
    if (route.request().method() !== 'POST') { await route.fallback(); return; }
    enquiries.push(route.request().postDataJSON());
    await route.fulfill({ status: 201, json: { success: true, data: { id: 'ENQ-2026-0001', createdAt: new Date().toISOString() } } });
  });
  return enquiries;
};

const fillContactForm = async (page) => {
  await page.locator('input[name="fullName"]').fill('Amira Khan');
  await page.locator('input[name="email"]').fill('amira@example.com');
  await page.locator('select[name="inquiryType"]').selectOption('general');
  await page.locator('[name="subject"]').fill('Bulk gifts');
  await page.locator('[name="message"]').fill('Do you deliver to Dubai?');
};

const countryCode = (scope) => scope.getByRole('combobox', { name: 'Country code' });

test.describe('international numbers on account and checkout forms', () => {
  test('checkout accepts an overseas number and sends it with its country code', async ({ page }) => {
    const item = { id: 'product-1', productId: 'product-1', name: 'Gift Box', price: 1000, quantity: 1, image: '/placeholder-product.png', maxStock: 10 };
    const serverProduct = { id: item.productId, name: item.name, price: item.price, stock: item.maxStock, images: [item.image] };
    const items = [{ id: 'cart-item-1', productId: item.productId, product: serverProduct, quantity: 1 }];
    await seedAuthenticatedUser(page);
    await seedCart(page, [item]);
    await mockApi(page);
    await page.route('**/api/v1/cart', (route) => route.fulfill({ json: { success: true, data: { cart: { items } } } }));
    let order;
    await page.route('**/api/v1/orders', async (route) => {
      order = route.request().postDataJSON();
      await route.fulfill({ json: { success: true, data: { order: { id: 'db-1', orderId: 'ORD-2026-0001', status: 'PENDING' } } } });
    });

    await page.goto('/checkout');
    await expect(page.getByText(/10 Digits/)).toHaveCount(0);
    await expect(page.getByText('Mobile / Phone Number *')).toBeVisible();
    await page.locator('input[name="fullName"]').fill('Amira Khan');
    await page.locator('input[name="email"]').fill('amira@example.com');
    await page.locator('input[name="pincode"]').fill('600001');
    await page.locator('input[name="addressLine1"]').fill('12 Test Street');
    await page.locator('input[name="city"]').fill('Coimbatore');
    await page.locator('input[name="state"]').fill('Tamil Nadu');

    await countryCode(page).selectOption('AE');
    await page.locator('input[name="phone"]').fill('9876543210');
    await page.getByRole('button', { name: /proceed to payment/i }).click();
    await expect(page.getByText('Please enter a valid mobile number for United Arab Emirates (+971).').first()).toBeVisible();

    await page.locator('input[name="phone"]').fill('501234567');
    await page.getByRole('button', { name: /proceed to payment/i }).click();
    await page.getByText('Cash on Delivery (COD)', { exact: true }).click();
    await page.getByRole('button', { name: /place order via cod/i }).click();
    await expect.poll(() => order?.shippingAddress?.phone).toBe('+971501234567');
  });

  test('checkout splits a saved number into its country and digits', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('ec_access_token', 'test-access-token');
      localStorage.setItem('ec_user', JSON.stringify({ id: 'user-1', name: 'Amira Khan', email: 'amira@example.com', role: 'USER', phone: '+971501234567' }));
    });
    const item = { id: 'product-1', productId: 'product-1', name: 'Gift Box', price: 1000, quantity: 1, image: '/placeholder-product.png', maxStock: 10 };
    await seedCart(page, [item]);
    await mockApi(page);
    await page.goto('/checkout');
    await expect(countryCode(page)).toHaveValue('AE');
    await expect(page.locator('input[name="phone"]')).toHaveValue('501234567');
  });

  test('the profile saves an overseas number and opens a saved one correctly', async ({ page }) => {
    await seedAuthenticatedUser(page);
    await mockApi(page);
    let saved;
    const account = { id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'USER' };
    await page.route('**/api/v1/auth/me', (route) => route.fulfill({ json: { success: true, data: { user: { ...account, phone: '+447400123456' } } } }));
    await page.route('**/api/v1/users/profile', async (route) => {
      saved = route.request().postDataJSON();
      await route.fulfill({ json: { success: true, data: { user: { ...account, phone: saved.phone } } } });
    });
    await page.goto('/profile');
    await expect(page.getByPlaceholder(/10-digit/i)).toHaveCount(0);
    const phone = page.getByRole('textbox', { name: 'Phone number' });
    await expect(phone).toHaveValue('7400123456');
    await expect(countryCode(page)).toHaveValue('GB');

    await countryCode(page).selectOption('AE');
    await phone.fill('123');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Please enter a valid mobile number for United Arab Emirates (+971).').first()).toBeVisible();
    expect(saved).toBeUndefined();

    await phone.fill('501234567');
    await page.screenshot({ path: 'test-results/phone-profile.png' });
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect.poll(() => saved?.phone).toBe('+971501234567');
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('ec_user')).phone), 'checkout reads the saved number from here').toBe('+971501234567');

    await phone.fill('');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect.poll(() => saved?.phone).toBe('');
  });

  test('registration accepts an overseas number', async ({ page }) => {
    await mockApi(page);
    let otpRequest;
    await page.route('**/api/v1/auth/request-otp', async (route) => {
      otpRequest = route.request().postDataJSON();
      await route.fulfill({ json: { success: true, data: {} } });
    });
    await page.goto('/register');
    await expect(page.getByPlaceholder(/9876543210/)).toHaveCount(0);
    const phone = page.getByRole('textbox', { name: 'Mobile number' });
    await expect(phone).toHaveAttribute('required', '');
    await countryCode(page).selectOption('AE');
    await phone.fill('98765');
    await phone.blur();
    await expect(page.getByText('Please enter a valid mobile number for United Arab Emirates (+971).').first()).toBeVisible();
    await phone.fill('501234567');
    await phone.blur();
    await expect(page.getByText(/valid mobile number/)).toHaveCount(0);
    await page.screenshot({ path: 'test-results/phone-register.png', fullPage: true });
    await page.locator('input[name="name"]').fill('Amira Khan');
    await page.locator('input[name="email"]').fill('amira@example.com');
    await page.getByRole('button', { name: /send otp/i }).click();
    await expect.poll(() => otpRequest?.phone).toBe('+971501234567');
  });
});

test.describe('international numbers on enquiry forms', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page, { product });
  });

  test('a UAE customer enquires with a UAE number', async ({ page }) => {
    const enquiries = await captureEnquiries(page);
    await page.goto('/contact');
    await expect(page.getByPlaceholder(/10-digit/i)).toHaveCount(0);
    await fillContactForm(page);

    const form = page.locator('form', { has: page.locator('input[name="fullName"]') });
    await countryCode(form).selectOption('AE');
    await expect(form.getByText('+971', { exact: true })).toBeVisible();
    await form.getByPlaceholder('Mobile Number (optional)').fill('50 123 4567');
    await form.scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'test-results/phone-contact-desktop.png' });
    await form.locator('button[type="submit"]').click();

    await expect.poll(() => enquiries.length).toBe(1);
    expect(enquiries[0].phone).toBe('+971501234567');
  });

  test('the number is checked against the selected country', async ({ page }) => {
    const enquiries = await captureEnquiries(page);
    await page.goto('/contact');
    await fillContactForm(page);
    const form = page.locator('form', { has: page.locator('input[name="fullName"]') });
    const phone = form.getByPlaceholder('Mobile Number (optional)');

    await phone.fill('9876543210');
    await expect(form.getByText(/valid mobile number/)).toHaveCount(0);

    await countryCode(form).selectOption('AE');
    await expect(form.getByText('Please enter a valid mobile number for United Arab Emirates (+971).')).toBeVisible();
    await expect(form.locator('button[type="submit"]'), 'cannot be sent with an invalid number').toBeDisabled();
    expect(enquiries).toHaveLength(0);

    await countryCode(form).selectOption('IN');
    await expect(form.getByText(/valid mobile number/)).toHaveCount(0);
    await form.locator('button[type="submit"]').click();
    await expect.poll(() => enquiries.length).toBe(1);
    expect(enquiries[0].phone).toBe('+919876543210');
  });

  test('the contact enquiry can be sent with no number', async ({ page }) => {
    const enquiries = await captureEnquiries(page);
    await page.goto('/contact');
    await fillContactForm(page);
    await page.locator('form', { has: page.locator('input[name="fullName"]') }).locator('button[type="submit"]').click();
    await expect.poll(() => enquiries.length).toBe(1);
    expect(enquiries[0]).not.toHaveProperty('phone');
  });

  test('pasting a full number selects its country', async ({ page }) => {
    await page.goto('/contact');
    const form = page.locator('form', { has: page.locator('input[name="fullName"]') });
    await form.getByPlaceholder('Mobile Number (optional)').fill('+1 202 555 0123');
    await expect(countryCode(form)).toHaveValue('US');
    await expect(form.getByPlaceholder('Mobile Number (optional)')).toHaveValue('2025550123');
  });

  test('the dropdown leads with India and the UAE', async ({ page }) => {
    await page.goto('/contact');
    const options = countryCode(page.locator('form', { has: page.locator('input[name="fullName"]') })).locator('option');
    await expect(options.nth(0)).toHaveText('India +91');
    await expect(options.nth(1)).toHaveText('United Arab Emirates +971');
    expect(await options.count()).toBeGreaterThan(200);
  });

  test('the product quote sends the full international number', async ({ page }) => {
    const enquiries = await captureEnquiries(page);
    await page.goto(`/product/${product.slug}`);
    await page.getByRole('button', { name: 'REQUEST QUOTE' }).click();
    const form = page.locator('form', { hasText: 'Submit Quote Request' });
    await form.getByPlaceholder('Enter your name').fill('Amira Khan');
    await form.getByPlaceholder('name@company.com').fill('amira@example.com');
    await countryCode(form).selectOption('SA');
    const phone = form.getByRole('textbox', { name: 'Phone number' });
    await expect(phone).toHaveAttribute('required', '');
    await phone.fill('512345678');
    await page.screenshot({ path: 'test-results/phone-product-quote.png' });
    await form.getByRole('button', { name: 'Submit Quote Request' }).click();
    await expect.poll(() => enquiries.length).toBe(1);
    expect(enquiries[0].phone).toBe('+966512345678');
  });

  test('the catalogue widget sends the full international number', async ({ page }) => {
    const enquiries = await captureEnquiries(page);
    await page.goto(`/product/${product.slug}`);
    await page.getByRole('button', { name: 'Download Product Catalogue' }).click();
    const form = page.locator('form', { hasText: 'Submit & Download' });
    await form.locator('input').first().fill('Amira Khan');
    await form.locator('input[type="email"], input[placeholder*="@"]').first().fill('amira@example.com');
    await countryCode(form).selectOption('GB');
    await form.getByRole('textbox', { name: 'Phone number' }).fill('7400123456');
    await page.screenshot({ path: 'test-results/phone-catalogue.png' });
    await form.getByRole('button', { name: /Submit & Download/ }).click();
    await expect.poll(() => enquiries.length).toBe(1);
    expect(enquiries[0].phone).toBe('+447400123456');
  });

  test('the contact page catalogue form accepts overseas numbers', async ({ page }) => {
    const enquiries = await captureEnquiries(page);
    await page.goto('/contact');
    await page.getByRole('button', { name: /catalogue/i }).first().click();
    let phone = page.getByRole('textbox', { name: 'Phone number' });
    await expect(phone).toHaveAttribute('required', '');
    await countryCode(page.locator('form', { has: phone })).selectOption('AE');
    await phone.fill('501234567');
    const catalogueForm = page.locator('form', { has: phone });
    await catalogueForm.locator('input').first().fill('Amira Khan');
    await catalogueForm.locator('input[type="email"]').fill('amira@example.com');
    await catalogueForm.locator('button[type="submit"]').click();
    await expect.poll(() => enquiries.length).toBe(1);
    expect(enquiries[0].phone).toBe('+971501234567');
  });

  test('the field fits a phone screen', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/contact');
    const form = page.locator('form', { has: page.locator('input[name="fullName"]') });
    const box = await form.getByPlaceholder('Mobile Number (optional)').boundingBox();
    expect(box.width).toBeGreaterThan(120);
    expect(box.x + box.width).toBeLessThanOrEqual(360);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    await page.screenshot({ path: 'test-results/phone-contact-mobile.png' });
  });

  test('the contact page appointment form accepts overseas numbers', async ({ page }) => {
    const enquiries = await captureEnquiries(page);
    await page.goto('/contact');
    await page.getByRole('button', { name: /appointment|visit|book/i }).first().click();
    const phone = page.getByRole('textbox', { name: 'Phone number' });
    await expect(phone).toHaveAttribute('required', '');
    const form = page.locator('form', { has: phone });
    await form.locator('input[name="name"]').fill('Amira Khan');
    await form.locator('input[name="email"]').fill('amira@example.com');
    await countryCode(form).selectOption('QA');
    await phone.fill('33123456');
    await phone.blur();
    await expect(form.getByText(/valid mobile number/)).toHaveCount(0);
    await page.screenshot({ path: 'test-results/phone-appointment.png' });
    await form.locator('button[type="submit"]').click();
    await expect.poll(() => enquiries.length).toBe(1);
    expect(enquiries[0].phone).toBe('+97433123456');
  });
});
