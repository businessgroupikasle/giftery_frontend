import { defineConfig, devices } from '@playwright/test';

// Runs e2e/customization-live.spec.js against the real API and PostgreSQL.
// TEST_DATABASE_URL must point at an isolated kilo_it_ schema prepared with `prisma migrate deploy`.
const API_PORT = 5100;
const WEB_PORT = 3100;

export default defineConfig({
  testDir: './e2e',
  testMatch: 'customization-live.spec.js',
  outputDir: './test-results/live',
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ...devices['Desktop Chrome'],
  },
  webServer: [
    {
      command: 'node tests/e2e-server.js',
      cwd: '../backend',
      env: { TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || '', PORT: String(API_PORT) },
      port: API_PORT,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      env: { BROWSER: 'none', VITE_API_BASE_URL: `http://localhost:${API_PORT}`, VITE_CDN_URL: `http://localhost:${API_PORT}/uploads` },
      port: WEB_PORT,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
