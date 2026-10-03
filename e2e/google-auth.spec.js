import { test, expect } from '@playwright/test';
import { mockApi } from './helpers/app.js';

test('customer signs in with Google and receives an application session', async ({ page }) => {
  await page.addInitScript(() => { window.__GIFTERY_CONFIG__ = { googleClientId: 'playwright-client-id.apps.googleusercontent.com' }; });
  await mockApi(page);
  await page.route('https://accounts.google.com/gsi/client', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `window.google={accounts:{id:{initialize:function(options){window.__googleCallback=options.callback},renderButton:function(element){var button=document.createElement('button');button.type='button';button.textContent='Continue with Google';button.onclick=function(){window.__googleCallback({credential:'verified-google-id-token'})};element.appendChild(button)},cancel:function(){}}}};`,
    });
  });

  let postedCredential = null;
  await page.route('**/api/v1/auth/google', async (route) => {
    postedCredential = (await route.request().postDataJSON()).credential;
    await route.fulfill({
      json: {
        token: 'google-session-token',
        user: { id: 'google-user-1', name: 'Google Customer', email: 'customer@gmail.com', role: 'CUSTOMER' },
      },
    });
  });

  await page.goto('/login');
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Continue with Google' }).click();

  await expect(page).toHaveURL(/\/$/);
  expect(postedCredential).toBe('verified-google-id-token');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('ec_access_token'))).toBe('google-session-token');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('ec_user') || 'null')?.email)).toBe('customer@gmail.com');
});
