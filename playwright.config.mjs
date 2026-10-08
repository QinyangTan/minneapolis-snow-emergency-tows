import { defineConfig } from '@playwright/test';

const pagesBase = process.env.PAGES_BASE_PATH || '';

export default defineConfig({
  testDir: './e2e',
  testIgnore: '**/winter.spec.mjs', // separate standalone Three.js production preview
  timeout: 45_000,
  expect: { timeout: 12_000 },
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'artifacts/playwright-report' }]],
  use: {
    baseURL: `http://127.0.0.1:4173${pagesBase}/`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    browserName: 'chromium',
    reducedMotion: 'reduce'
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: `http://127.0.0.1:4173${pagesBase}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
