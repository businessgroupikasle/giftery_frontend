// Full lifecycle against the real API and database: see playwright.live.config.js.
/* global DataTransfer, File */
import { Buffer } from 'node:buffer';
import { test, expect } from '@playwright/test';

const PASSWORD = 'Studio-Test-123';
const CASEY = 'casey@example.invalid';
const SAM = 'sam@example.invalid';
const STAFF = 'staff@example.invalid';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAFCAIAAADzBuo/AAAAEUlEQVR4nGO4OVsND2IYQGkAYwdQFRxMlakAAAAASUVORK5CYII=', 'base64');
const logoPng = { name: 'acme-logo.png', mimeType: 'image/png', buffer: png };
const logoSvg = { name: 'acme-mark.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#d99b26"/></svg>') };
const evilSvg = { name: 'evil.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>') };

const login = async (page, email) => {
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: /Sign In to Dashboard/ }).click();
};

const signInFresh = async (page, email, target) => {
  await page.goto('/login');
  await login(page, email);
  await expect(page).not.toHaveURL(/\/login/);
  if (target) await page.goto(target);
};

const step = (page, name) => page.getByRole('navigation', { name: 'Customization steps' }).getByRole('button', { name: new RegExp(name) });
const saved = (page) => expect(page.getByTestId('save-status')).toHaveText('Draft saved to your account');
const stage = (page) => page.getByTestId('design-stage');

const dropFile = async (page, testId, file) => {
  const dataTransfer = await page.evaluateHandle(({ name, type, bytes }) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(bytes)], name, { type }));
    return transfer;
  }, { name: file.name, type: file.mimeType, bytes: [...file.buffer] });
  await page.getByTestId(testId).dispatchEvent('drop', { dataTransfer });
};

const dragBy = async (page, locator, dx, dy) => {
  const box = await locator.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 3 });
  await page.mouse.move(x + dx, y + dy, { steps: 3 });
  await page.mouse.up();
};

const completeCheckout = async (page) => {
  await page.locator('input[name="fullName"]').fill('Casey Customer');
  await page.locator('input[name="email"]').fill('casey@example.com');
  await page.locator('input[name="phone"]').fill('9876543210');
  await page.locator('input[name="pincode"]').fill('600001');
  await page.locator('input[name="addressLine1"]').fill('12 Test Street');
  await page.locator('input[name="city"]').fill('Coimbatore');
  await page.locator('input[name="state"]').fill('Tamil Nadu');
  await page.getByRole('button', { name: /proceed to payment/i }).click();
  await page.getByText('Cash on Delivery (COD)', { exact: true }).click();
  await page.getByRole('button', { name: /place order via cod/i }).click();
};

const apiToken = (page) => page.evaluate(() => localStorage.getItem('ec_access_token'));
const myDesign = async (page, name) => {
  const response = await page.request.get('http://localhost:5100/api/v1/customizations/designs', { headers: { Authorization: `Bearer ${await apiToken(page)}` } });
  const summary = (await response.json()).data.data.find((design) => design.name === name);
  const full = await page.request.get(`http://localhost:5100/api/v1/customizations/designs/${summary.id}`, { headers: { Authorization: `Bearer ${await apiToken(page)}` } });
  return (await full.json()).data;
};

const elementBox = (locator) => locator.evaluate((node) => ({ left: node.style.left, top: node.style.top, width: node.style.width, transform: node.style.transform }));

test.describe.configure({ mode: 'serial' });

test.describe('customization lifecycle', () => {
  let designUrl;
  let context;
  let page;
  const pageErrors = [];

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ viewport: { width: 1440, height: 950 }, acceptDownloads: true });
    page = await context.newPage();
    page.on('pageerror', (error) => pageErrors.push(error.message));
  });
  test.afterAll(async () => { await context.close(); });

  test('guests are sent to sign in and come back to the studio', async () => {
    await page.goto('/product/studio-mug');
    await expect(page.getByRole('heading', { name: 'Customize This Product' })).toBeVisible();
    await expect(page.getByText('Personalize your product with your own designs.')).toBeVisible();
    await expect(page.getByText('Add logos, text, stickers, images and other creative elements.')).toBeVisible();
    await page.getByRole('button', { name: 'Start Customizing' }).click();
    await expect(page).toHaveURL(/\/login/);
    await login(page, CASEY);
    await expect(page).toHaveURL(/\/customize\/studio-mug/);
    await expect(page.getByRole('heading', { name: 'Studio Mug' })).toBeVisible();
  });

  test('step 1 shows real options, quantity and supported tools', async () => {
    await expect(page.getByRole('radio', { name: 'Small' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Large' })).toBeVisible();
    await expect(page.getByText('Material')).toHaveCount(0);
    await expect(page.getByText('₹50.00 customization per unit')).toBeVisible();
    await page.getByRole('radio', { name: 'Large' }).click();
    await page.getByRole('button', { name: 'Increase quantity' }).click();
    await page.getByLabel('Design name').fill('Acme welcome mug');
    await saved(page);
    await expect(page).toHaveURL(/design=/);
  });

  test('step 2 uploads logos by file and drag and drop, and rejects unsafe files', async () => {
    await step(page, 'Logo').click();
    await page.getByLabel('Choose logos or drag them here').setInputFiles([logoPng, logoSvg]);
    await expect(page.locator('[data-element-type="logo"]')).toHaveCount(2);
    await dropFile(page, 'logo-dropzone', logoPng);
    await expect(page.locator('[data-element-type="logo"]')).toHaveCount(3);

    await page.getByLabel('Choose logos or drag them here').setInputFiles([evilSvg]);
    await expect(page.getByText(/contains scripts or external references/)).toBeVisible();
    await expect(page.locator('[data-element-type="logo"]')).toHaveCount(3);

    // Aspect ratio is kept: the 10x5 PNG sits in a 2:1 box.
    const logo = page.locator('[data-element-type="logo"]').first();
    const box = await logo.boundingBox();
    expect(Math.abs(box.width / box.height - 2)).toBeLessThan(0.1);

    // Remove the extra logo, replace another, then move and resize the first.
    await page.locator('[data-element-type="logo"]').nth(2).click();
    await page.keyboard.press('Delete');
    await expect(page.locator('[data-element-type="logo"]')).toHaveCount(2);

    await dragBy(page, page.locator('[data-element-type="logo"]').last(), 180, 180);
    await logo.click();
    const before = await elementBox(logo);
    await dragBy(page, logo, 60, -80);
    const moved = await elementBox(logo);
    expect(moved.left).not.toEqual(before.left);
    expect(moved.top).not.toEqual(before.top);
    const widthBefore = (await logo.boundingBox()).width;
    await dragBy(page, logo.locator('[data-handle="se"]'), 40, 20);
    expect((await logo.boundingBox()).width).toBeGreaterThan(widthBefore);
    const resized = await logo.boundingBox();
    expect(Math.abs(resized.width / resized.height - 2)).toBeLessThan(0.15);
    await dragBy(page, logo.locator('[data-handle="rotate"]'), 80, 60);
    expect((await elementBox(logo)).transform).toMatch(/rotate\((?!0deg)/);

    // Properties panel drives the same values.
    await page.getByLabel('X %').fill('30');
    expect((await elementBox(logo)).left).toBe('30%');
    await page.getByLabel('Keep proportions').uncheck();
    await page.getByLabel('Keep proportions').check();
    await page.getByLabel('Replace this logo').setInputFiles([logoSvg]);
    await saved(page);
  });

  test('step 3 adds styled text, with undo and redo', async () => {
    await step(page, 'Text').click();
    for (const role of ['Custom heading', 'Name', 'Message', 'Company name', 'Custom description']) {
      await page.getByRole('button', { name: `+ ${role}` }).click();
    }
    await expect(page.locator('[data-element-type="text"]')).toHaveCount(5);

    await page.getByRole('button', { name: 'Add a short description' }).click().catch(() => {});
    await page.getByRole('button', { name: 'Your name' }).first().click();
    await page.getByLabel('Your text').fill('Casey & Co');
    const name = page.locator('[data-element-type="text"]', { hasText: 'Casey & Co' });
    await expect(name).toBeVisible();
    await page.locator('[data-testid="properties-panel"] select').selectOption('Dancing Script');
    await page.getByRole('button', { name: 'Align left' }).click();
    await page.getByRole('group', { name: 'Text style' }).getByRole('button', { name: 'I', exact: true }).click();
    await page.getByLabel('Text colour #e0475b').click();
    await page.getByRole('button', { name: 'None', exact: true }).first().isVisible();
    await expect(name.locator('div div')).toHaveCSS('font-family', /Dancing Script/);
    await expect(name.locator('div div')).toHaveCSS('font-style', 'italic');
    await expect(name.locator('div div')).toHaveCSS('color', 'rgb(224, 71, 91)');

    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(name.locator('div div')).not.toHaveCSS('color', 'rgb(224, 71, 91)');
    await page.getByRole('button', { name: 'Redo' }).click();
    await expect(name.locator('div div')).toHaveCSS('color', 'rgb(224, 71, 91)');
    await saved(page);
  });

  test('step 4 searches, filters and places stickers and graphics', async () => {
    await step(page, 'Stickers').click();
    await page.getByLabel('Search stickers').fill('trophy');
    await expect(page.getByRole('button', { name: 'Add Trophy sticker' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Heart sticker' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Add Trophy sticker' }).click();
    await page.getByLabel('Search stickers').fill('');
    await page.getByRole('group', { name: 'Sticker categories' }).getByRole('button', { name: 'Love' }).click();
    await expect(page.getByRole('button', { name: 'Add Rose sticker' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Trophy sticker' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Add Rose sticker' }).click();
    await expect(page.locator('[data-element-type="sticker"]')).toHaveCount(2);

    const rose = page.locator('[data-element-type="sticker"]').last();
    await dragBy(page, rose, -120, 120);
    await page.keyboard.press('Delete');
    await expect(page.locator('[data-element-type="sticker"]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.locator('[data-element-type="sticker"]')).toHaveCount(2);

    await page.getByRole('tab', { name: 'Graphics' }).click();
    await page.getByRole('button', { name: 'Add Divider' }).click();
    await expect(page.locator('[data-element-type="shape"]')).toHaveCount(1);
    await page.getByLabel('Upload your own graphic').setInputFiles([logoPng]);
    await expect(page.locator('[data-element-type="graphic"]')).toHaveCount(1);
    await saved(page);
  });

  test('step 5 sets background, pattern, border and templates', async () => {
    await step(page, 'Design').click();
    await page.getByLabel('Background colour #f4a9c0').click();
    await page.getByRole('button', { name: 'Hearts' }).click();
    await page.getByLabel('Border style').selectOption('dashed');
    await expect(page.getByTestId('design-background')).toBeVisible();
    await expect(page.getByTestId('design-background')).toHaveCSS('border-top-style', 'dashed');
    await page.getByLabel('Upload a background').setInputFiles([logoPng]);
    await expect(page.getByTestId('design-background').locator('img')).toBeVisible();

    const elementsBefore = await page.locator('[data-element-id]').count();
    await page.getByRole('tab', { name: 'Templates' }).click();
    await page.getByRole('button', { name: /Birthday bash/ }).click();
    await expect(page.locator('[data-element-type="logo"]')).toHaveCount(2);
    await expect(page.locator('[data-element-type="text"]', { hasText: 'Happy Birthday' })).toBeVisible();
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.locator('[data-element-id]')).toHaveCount(elementsBefore);
    await saved(page);
  });

  test('step 6 previews with zoom, gallery switching and the mockup notice', async () => {
    await step(page, 'Preview').click();
    await expect(page.getByText(/Visual mockup only/)).toBeVisible();
    await expect(page.getByText('Illustrative design area, not a print boundary')).toBeVisible();

    const widthAtFit = (await stage(page).boundingBox()).width;
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect.poll(async () => (await stage(page).boundingBox()).width).toBeGreaterThan(widthAtFit);
    const logo = page.locator('[data-element-type="logo"]').first();
    const before = await elementBox(logo);
    await dragBy(page, logo, 30, 30);
    expect((await elementBox(logo)).left).not.toEqual(before.left);
    await page.getByRole('button', { name: 'Zoom out' }).click();
    await page.getByRole('button', { name: 'Mobile preview' }).click();
    await expect.poll(async () => (await stage(page).boundingBox()).width).toBeLessThanOrEqual(341);
    await page.getByRole('button', { name: 'Desktop preview' }).click();

    await page.getByRole('button', { name: 'Show gallery image 2' }).click();
    await expect(page.getByAltText('Product mockup')).toHaveAttribute('src', /product-placeholder/);
    await page.getByRole('button', { name: 'Show gallery image 1' }).click();
    await expect(page.getByAltText('Product mockup')).toHaveAttribute('src', /about_hero_gift_set/);

    await page.getByRole('tab', { name: 'Layers' }).click();
    await expect(page.getByText('Trophy')).toBeVisible();
    await page.screenshot({ path: 'test-results/live/studio-desktop.png', fullPage: false });
    await saved(page);
  });

  test('step 7 keeps instructions and reference images', async () => {
    await step(page, 'Instructions').click();
    await page.getByLabel('Special customization requirements').fill('Match our brand gold exactly.');
    await page.getByLabel('Delivery-related instructions').fill('Deliver before Friday.');
    await page.getByLabel('Preferred design description').fill('Clean and premium.');
    await page.getByLabel('Additional notes').fill('Call before printing.');
    await page.getByLabel('Upload reference images').setInputFiles([logoPng]);
    await expect(page.getByAltText('acme-logo.png')).toBeVisible();
    await saved(page);
  });

  test('a refresh, a reopened browser and the product page all keep the draft', async () => {
    designUrl = page.url().replace(/&?step=[^&]*/, '');
    await page.reload();
    await expect(page.getByLabel('Special customization requirements')).toHaveValue('Match our brand gold exactly.');
    await step(page, 'Preview').click();
    await expect(page.locator('[data-element-type="logo"]')).toHaveCount(2);
    await expect(page.locator('[data-element-type="logo"] img').first()).toBeVisible();
    await expect(page.locator('[data-element-type="text"]', { hasText: 'Casey & Co' })).toBeVisible();
    await expect(page.locator('[data-element-type="sticker"]')).toHaveCount(2);
    await expect(page.getByTestId('design-background')).toHaveCSS('border-top-style', 'dashed');
    await step(page, 'Product').click();
    await expect(page.getByRole('radio', { name: 'Large' })).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByLabel('Quantity', { exact: true })).toHaveValue('2');

    const reopened = await context.newPage();
    await reopened.goto('/product/studio-mug');
    await expect(reopened.getByRole('heading', { name: 'Your saved designs' })).toBeVisible();
    await expect(reopened.getByText('Acme welcome mug')).toBeVisible();
    await reopened.getByRole('link', { name: 'Edit' }).click();
    await expect(reopened).toHaveURL(/design=/);
    await reopened.close();
  });

  test('another customer can never open this design', async ({ browser }) => {
    const other = await browser.newContext();
    const strangerPage = await other.newPage();
    await signInFresh(strangerPage, SAM);
    await strangerPage.goto(designUrl);
    await expect(strangerPage.getByRole('alert')).toContainText('could not be found');
    await strangerPage.goto('/my-designs');
    await expect(strangerPage.getByText('You have no saved designs yet')).toBeVisible();
    await expect(strangerPage.getByText('Acme welcome mug')).toHaveCount(0);
    await other.close();
  });

  test('step 8 reviews everything with the charge in the total', async () => {
    await page.goto(`${designUrl}&step=review`);
    await expect(page.getByRole('heading', { name: 'Review your customization' })).toBeVisible();
    await expect(page.getByText('Acme welcome mug')).toBeVisible();
    await expect(page.getByText('Size: Large')).toBeVisible();
    await expect(page.getByText('Name: Casey & Co')).toBeVisible();
    await expect(page.getByText('Trophy, Rose')).toBeVisible();
    await expect(page.getByText('Match our brand gold exactly.')).toBeVisible();
    await expect(page.getByText('₹50.00 per unit')).toBeVisible();
    await expect(page.getByTestId('review-total')).toHaveText('₹1,100.00');
    await page.screenshot({ path: 'test-results/live/studio-review.png', fullPage: true });

    await page.getByRole('button', { name: 'Save Customization' }).click();
    await expect(page.getByText('Customization saved to your account.')).toBeVisible();
    await expect(page.getByText('This version is saved to your account.')).toBeVisible();
    await page.getByRole('button', { name: 'Edit Design' }).click();
    await expect(stage(page)).toBeVisible();
    await step(page, 'Review').click();
  });

  test('the cart shows the customization and keeps it through quantity changes', async () => {
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page).toHaveURL(/\/cart/);
    const summary = page.getByTestId('customization-summary').first();
    await expect(summary).toContainText('Acme welcome mug');
    await expect(summary).toContainText('Size: Large');
    await expect(summary).toContainText('2 logos');
    await expect(summary).toContainText('special instructions');
    await expect(summary).toContainText('₹50');
    await expect(page.getByRole('img', { name: 'Studio Mug' }).first()).toHaveAttribute('src', /^blob:/);
    await expect(page.getByText('₹550.00').first()).toBeVisible();

    await page.getByRole('button', { name: '+', exact: true }).first().click();
    await expect(page.locator('[class*="qtyStepper"] span').first()).toHaveText('3');
    await page.reload();
    await expect(page.getByTestId('customization-summary').first()).toContainText('Acme welcome mug');
    await expect(page.locator('[class*="qtyStepper"] span').first()).toHaveText('3');
    await page.screenshot({ path: 'test-results/live/cart.png', fullPage: true });

    // A second design of the same product is its own line; an ordinary purchase is unaffected.
    await page.goto('/product/studio-mug');
    await page.getByRole('button', { name: 'ADD TO CART' }).click();
    await expect(page.getByText(/Added 1 x Studio Mug/)).toBeVisible();
    await page.goto('/cart');
    await expect(page.getByTestId('customization-summary')).toHaveCount(1);
    await expect(page.getByText('₹500.00').first()).toBeVisible();
  });

  test('checkout keeps the customization through a refresh and places the order', async () => {
    await page.goto('/checkout');
    await expect(page.getByTestId('customization-summary').first()).toContainText('Acme welcome mug');
    await page.reload();
    await expect(page.getByTestId('customization-summary').first()).toContainText('Acme welcome mug');
    await completeCheckout(page);
    await expect(page.getByRole('heading', { name: /Thank You For Your Order/ })).toBeVisible({ timeout: 20_000 });

    // Confirmation shows every line, with totals calculated by the server.
    const rows = page.getByRole('table').getByRole('row');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(1)).toContainText('Studio Mug');
    await expect(page.getByRole('table').getByTestId('customization-summary')).toContainText('Acme welcome mug');
    await expect(page.getByRole('table').getByText('₹1,650.00')).toBeVisible();
    await expect(page.getByText('GST (18%)')).toBeVisible();
    await expect(page.getByText('₹387.00')).toBeVisible();
    await expect(page.getByTestId('success-total')).toHaveText('₹2,537.00');
    await page.screenshot({ path: 'test-results/live/order-success.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.screenshot({ path: 'test-results/live/order-success-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1440, height: 950 });
  });

  test('order history shows the customization and its status', async () => {
    await page.goto('/orders');
    await expect(page.getByText(/Customized/).first()).toBeVisible();
    await expect(page.getByText('Pending Review').first()).toBeVisible();
    await page.getByRole('button', { name: /View Details/ }).first().click();
    const details = page.getByTestId('customization-details').first();
    await expect(details).toContainText('Acme welcome mug');
    await expect(details).toContainText('Casey & Co');
    await expect(details).toContainText('Match our brand gold exactly.');
    await expect(details).toContainText('Trophy, Rose');
    await expect(page.getByText(/Visual mockup, not a print proof/)).toBeVisible();
    await page.screenshot({ path: 'test-results/live/order-details.png' });
    await page.getByRole('button', { name: 'Close invoice' }).click();

    // Editing the saved design afterwards never changes the placed order.
    await page.goto(`${designUrl}&step=preview`);
    await page.getByRole('tab', { name: 'Text' }).click();
    await page.getByRole('button', { name: 'Casey & Co', exact: true }).click();
    await page.getByLabel('Your text').fill('Changed later');
    await saved(page);
    await page.goto('/orders');
    await page.getByRole('button', { name: /View Details/ }).first().click();
    await expect(page.getByTestId('customization-details').first()).toContainText('Casey & Co');
    await expect(page.getByTestId('customization-details').first()).not.toContainText('Changed later');
  });

  test('staff review the uploads and instructions and track status', async ({ browser }) => {
    const staffContext = await browser.newContext({ viewport: { width: 1440, height: 950 }, acceptDownloads: true });
    const staff = await staffContext.newPage();
    await signInFresh(staff, STAFF);
    await expect(staff).toHaveURL(/\/dashboard/);
    await staff.getByRole('button', { name: 'Customized Products' }).click();
    await expect(staff.getByRole('cell', { name: /Casey Customer/ })).toBeVisible();
    await staff.getByRole('button', { name: /View customization/ }).click();
    const details = staff.getByTestId('customization-details');
    await expect(details).toContainText('Acme welcome mug');
    await expect(details).toContainText('acme-logo.png');
    await expect(details).toContainText('Casey & Co');
    await expect(details).toContainText('Deliver before Friday.');
    await expect(details.getByRole('img').first()).toHaveAttribute('src', /^blob:/);

    const [imageDownload] = await Promise.all([staff.waitForEvent('download'), details.getByRole('button', { name: 'Download image' }).first().click()]);
    expect(imageDownload.suggestedFilename()).toMatch(/\.(png|jpg)$/);
    const [vectorDownload] = await Promise.all([staff.waitForEvent('download'), details.getByRole('button', { name: 'Download original SVG' }).first().click()]);
    expect(vectorDownload.suggestedFilename()).toBe('acme-mark.svg');
    await staff.screenshot({ path: 'test-results/live/admin-details.png' });

    await staff.getByLabel('Note shown to the customer').fill('Approved, printing Monday.');
    await staff.getByLabel('Review status').selectOption('DESIGN_APPROVED');
    await expect(staff.getByText('Status updated to Design Approved.')).toBeVisible();
    await staff.getByRole('button', { name: 'Close details' }).click();
    await staff.getByRole('button', { name: /^Design Approved \(1\)/ }).click();
    await expect(staff.getByRole('cell', { name: /Casey Customer/ })).toBeVisible();

    // The order panel opens the same details.
    await staff.getByRole('button', { name: 'Orders', exact: true }).first().click();
    await staff.getByTitle('View Details').first().click();
    await expect(staff.getByTestId('customization-details').first()).toContainText('Acme welcome mug');
    await staffContext.close();

    await page.goto('/orders');
    await expect(page.getByText('Design Approved').first()).toBeVisible();
    await page.getByRole('button', { name: /View Details/ }).first().click();
    await expect(page.getByTestId('customization-details').first()).toContainText('Approved, printing Monday.');
    await page.getByRole('button', { name: 'Close invoice' }).click();
  });

  test('Buy Now with a design leaves the cart alone and survives a refresh', async () => {
    await page.goto('/customize/default-gift');
    await expect(page.getByText('This product has no size, colour or material options to choose.')).toBeVisible();
    await step(page, 'Text').click();
    await page.getByRole('button', { name: '+ Name' }).click();
    await page.getByLabel('Your text').fill('Buy now name');
    await step(page, 'Review').click();
    await expect(page.getByText('No extra charge')).toBeVisible();
    await page.getByRole('button', { name: 'Buy Now' }).click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByTestId('customization-summary').first()).toContainText('My design');
    const bought = await myDesign(page, 'My design');
    expect(bought.status).toBe('SAVED');
    expect(bought.previewInfo.includesProductImage, 'a CORS-enabled product photo is part of the preview').toBe(true);
    await page.reload();
    await expect(page.getByTestId('customization-summary').first()).toContainText('My design');
    await completeCheckout(page);
    await expect(page.getByRole('heading', { name: /Thank You For Your Order/ })).toBeVisible({ timeout: 20_000 });
    await page.goto('/orders');
    await page.getByRole('button', { name: /View Details/ }).first().click();
    await expect(page.getByTestId('customization-details').first()).toContainText('Buy now name');
    await page.getByRole('button', { name: 'Close invoice' }).click();
  });

  test('a product photo that forbids export still lets the customer save', async () => {
    await page.goto('/customize/no-cors-photo?step=text');
    await page.getByRole('button', { name: '+ Name' }).click();
    await page.getByLabel('Design name').fill('No CORS design');
    await step(page, 'Review').click();
    await page.getByRole('button', { name: 'Save Customization' }).click();
    await expect(page.getByText('Customization saved to your account.')).toBeVisible();
    const design = await myDesign(page, 'No CORS design');
    expect(design.status).toBe('SAVED');
    expect(design.previewInfo.includesProductImage).toBe(false);
    await expect(page.getByAltText('Product mockup')).toHaveAttribute('src', /5101/);
  });

  test('staff choose the options and charge a product offers', async ({ browser }) => {
    const staffContext = await browser.newContext({ viewport: { width: 1440, height: 950 } });
    const staff = await staffContext.newPage();
    await signInFresh(staff, STAFF);
    await staff.getByRole('button', { name: 'Products', exact: true }).first().click();
    await staff.locator('tr', { hasText: 'Default Gift' }).getByRole('button', { name: 'Edit' }).click();
    const settings = staff.getByRole('group', { name: 'Customization studio' });
    await settings.getByLabel(/Sizes/).fill('Mini, Maxi');
    await settings.getByLabel(/Materials/).fill('Oak');
    await settings.getByLabel(/charge per unit/).fill('25');
    await settings.getByLabel('Stickers').uncheck();
    await staff.getByRole('button', { name: 'Update Product' }).click();
    await expect(staff.getByRole('button', { name: 'Update Product' })).toHaveCount(0);
    await staffContext.close();

    await page.goto('/customize/default-gift');
    await expect(page.getByRole('radio', { name: 'Maxi' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Oak' })).toBeVisible();
    await expect(page.getByText('₹25.00 customization per unit')).toBeVisible();
    await step(page, 'Stickers').click();
    await expect(page.getByRole('tab', { name: 'Stickers' })).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'Graphics' })).toBeVisible();

    // Saving is refused until the new required options are chosen.
    await page.getByRole('tab', { name: 'Text' }).click();
    await page.getByRole('button', { name: '+ Name' }).click();
    await step(page, 'Review').click();
    await page.getByRole('button', { name: 'Save Customization' }).click();
    await expect(page.getByText('Please select a size first.')).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Maxi' })).toBeVisible();
  });

  test('only tools a product supports are offered', async () => {
    await page.goto('/customize/text-only-pen');
    const steps = page.getByRole('navigation', { name: 'Customization steps' });
    await expect(steps.getByRole('button')).toHaveCount(5);
    await expect(steps.getByRole('button', { name: /Logo/ })).toHaveCount(0);
    await step(page, 'Text').click();
    await expect(page.getByRole('tab')).toHaveText(['Text', 'Layers']);

    await page.goto('/product/fixed-trophy');
    await expect(page.getByRole('heading', { name: 'Fixed Trophy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Customizing' })).toHaveCount(0);
    await page.goto('/customize/fixed-trophy');
    await expect(page.getByRole('alert')).toContainText('cannot be customized');
  });

  test('a design can be deleted and removed from My Designs', async () => {
    await page.goto('/my-designs');
    await expect(page.getByText('Acme welcome mug')).toBeVisible();
    await page.getByRole('button', { name: 'Duplicate' }).first().click();
    await expect(page).toHaveURL(/\/customize\/.*design=/);
    await page.goto('/my-designs');
    const copies = page.getByText(/\(copy\)/);
    await expect(copies).toHaveCount(1);
    await page.locator('li', { hasText: '(copy)' }).getByRole('button', { name: 'Delete' }).click();
    await expect(copies).toHaveCount(0);
  });

  test('the studio fits a phone and works by touch', async ({ browser }) => {
    const storage = await context.storageState();
    const mobile = await browser.newContext({ storageState: storage, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const phone = await mobile.newPage();
    await phone.goto('/customize/studio-mug?step=stickers');
    await phone.getByRole('button', { name: 'Add Star sticker' }).tap();
    await expect(phone.locator('[data-element-type="sticker"]')).toHaveCount(1);
    const sticker = phone.locator('[data-element-type="sticker"]');
    await sticker.tap();

    // A real finger drag moves the element; the page itself does not scroll instead.
    const before = await elementBox(sticker);
    const start = await sticker.boundingBox();
    const scrollBefore = await phone.evaluate(() => window.scrollY);
    const touch = await mobile.newCDPSession(phone);
    const point = (x, y) => [{ x: start.x + start.width / 2 + x, y: start.y + start.height / 2 + y }];
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(0, 0) });
    for (const offset of [10, 25, 40, 60]) await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(offset, offset) });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => (await elementBox(sticker)).left).not.toEqual(before.left);
    expect((await elementBox(sticker)).top).not.toEqual(before.top);
    expect(await phone.evaluate(() => window.scrollY)).toBe(scrollBefore);

    const widths = await phone.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    expect(widths.document).toBeLessThanOrEqual(widths.viewport);
    const stageBox = await stage(phone).boundingBox();
    expect(stageBox.x).toBeGreaterThanOrEqual(0);
    expect(stageBox.x + stageBox.width).toBeLessThanOrEqual(390);
    await phone.screenshot({ path: 'test-results/live/studio-mobile.png', fullPage: true });
    await expect(phone.getByTestId('save-status')).toHaveText('Draft saved to your account');
    await mobile.close();
  });

  test('no uncaught errors occurred in the customer session', () => {
    expect(pageErrors).toEqual([]);
  });
});
