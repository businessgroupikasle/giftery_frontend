const fs = require('node:fs');

const envPath = 'src/config/env.js';
let env = fs.readFileSync(envPath, 'utf8');
env = env.replace(
  "GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',",
  "GOOGLE_CLIENT_ID: globalThis.__GIFTERY_CONFIG__?.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '',",
);
fs.writeFileSync(envPath, env);

const testPath = 'e2e/google-auth.spec.js';
let test = fs.readFileSync(testPath, 'utf8');
test = test.replace(
  "test('customer signs in with Google and receives an application session', async ({ page }) => {\r\n  await mockApi(page);",
  "test('customer signs in with Google and receives an application session', async ({ page }) => {\r\n  await page.addInitScript(() => { window.__GIFTERY_CONFIG__ = { googleClientId: 'playwright-client-id.apps.googleusercontent.com' }; });\r\n  await mockApi(page);",
);
fs.writeFileSync(testPath, test);
