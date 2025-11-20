import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Run tests in parallel where possible. Use half of available CPUs on CI
  // (e.g. '50%') so we don't overload hosted runners; locally leave Playwright
  // to choose a sensible default (undefined).
  workers: process.env.CI ? '50%' : undefined,
  reporter: 'html',
  // NOTE: E2E tests use port 3002 to avoid conflicts with the standard development server (port 3000).
  // If you are running the development server on port 3000, E2E tests will start a separate instance on port 3002.
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // The web server for E2E tests runs on port 3002 to avoid interfering with local development on port 3000.
  webServer: {
    command: 'PORT=3002 NEXT_PUBLIC_FEATURE_LANDING=true npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
