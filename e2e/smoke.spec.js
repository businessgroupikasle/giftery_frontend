import { test, expect } from '@playwright/test';

const collectPageErrors = (page) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};

test.describe('Application smoke and routing', () => {
  test('homepage loads without uncaught browser errors', async ({ page }) => {
    const pageErrors = collectPageErrors(page);
    const response = await page.goto('/');

    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('#root')).toBeAttached();
    expect(pageErrors, `Encountered browser errors: ${pageErrors.join(', ')}`).toEqual([]);
  });

  test('forbidden route renders a dedicated access-denied page', async ({ page }) => {
    const pageErrors = collectPageErrors(page);
    await page.goto('/403');

    await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
    expect(pageErrors).toEqual([]);
  });

  test('login page renders without undefined forgot-password handlers', async ({ page }) => {
    const pageErrors = collectPageErrors(page);
    await page.goto('/login');

    await expect(page.locator('#root')).toBeAttached();
    expect(pageErrors, `Encountered browser errors: ${pageErrors.join(', ')}`).toEqual([]);
  });

  test('unknown routes render the not-found page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.locator('#root')).toContainText(/404|not found/i);
  });

  test('catalogue form rejects a numeric-only full name', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Download Product Catalogue' }).click();

    const fullName = page.getByLabel('Full Name');
    await fullName.fill('1555555');
    await fullName.blur();

    await expect(page.getByText('Please enter a valid full name.', { exact: true })).toBeVisible();
    await expect(fullName).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('button', { name: 'Submit & Download' })).toBeDisabled();
  });

  test('contact form requires a valid phone number', async ({ page }) => {
    await page.goto('/contact');

    const phone = page.getByPlaceholder('10-digit Mobile Number *');
    await expect(phone).toHaveAttribute('required', '');
    await phone.focus();
    await phone.blur();

    await expect(page.getByText('Please enter a valid 10-digit mobile number', { exact: true })).toBeVisible();
    await expect(phone).toHaveAttribute('aria-invalid', 'true');
  });
});
