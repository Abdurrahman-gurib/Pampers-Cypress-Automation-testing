import { defineConfig, devices } from '@playwright/test';
import { getProcessValue } from './playwright/utilities/util';

process.env.MARKET_CULTURE = getProcessValue(`MARKET_CULTURE`) || process.env.MARKET_CULTURE;
process.env.MARKET_ENV = getProcessValue(`MARKET_ENV`) || process.env.MARKET_ENV;
process.env.NO_INDEX = getProcessValue(`NO_INDEX`);

export default defineConfig({
  testDir: './playwright/tests',
  timeout: 180 * 1000,
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 20 : undefined,
  reporter: `dot`,
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
    headless: true,
    viewport: { width: 1920, height: 1080},
    screenshot: 'off',
    browserName: 'chromium'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ]
});
