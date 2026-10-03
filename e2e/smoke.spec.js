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
});