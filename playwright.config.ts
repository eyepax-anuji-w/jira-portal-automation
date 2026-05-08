import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const isCI = !!process.env.CI;
const headed = process.env.HEADED === 'true';
const workers = Number(process.env.WORKERS ?? (isCI ? 2 : 1));
const htmlOutputFolder = process.env.PLAYWRIGHT_HTML_OUTPUT ?? 'playwright-report';
const slowMo = Number(process.env.SLOW_MO ?? 0) || 0;

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  workers,
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: htmlOutputFolder }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright'],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://jira2-stage.eyepax.info',
    headless: !headed,
    launchOptions: {
      slowMo,
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
