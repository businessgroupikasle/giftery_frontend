const fs = require('node:fs');
const path = 'e2e/google-auth.spec.js';
let source = fs.readFileSync(path, 'utf8');
if (!source.includes('__GIFTERY_CONFIG__')) {
  source = source.replace(
    /(test\('customer signs in with Google and receives an application session', async \(\{ page \}\) => \{\r?\n)/,
    "$1  await page.addInitScript(() => { window.__GIFTERY_CONFIG__ = { googleClientId: 'playwright-client-id.apps.googleusercontent.com' }; });\r\n",
  );
}
fs.writeFileSync(path, source);
