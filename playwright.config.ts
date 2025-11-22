import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for E2E tests — runs a local dev server on port 3002 and sets E2E env vars
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: "bash -lc '[[ -f .env.test ]] && source .env.test || true; E2E_TEST=1 NODE_ENV=test PORT=3002 NEXT_PUBLIC_FEATURE_LANDING=true npm run dev'",
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
