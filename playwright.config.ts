import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },

  // Automates starting the server before running tests
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    timeout: 120 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Optional: comment out Firefox and WebKit if you only want to test Chromium for now
  ],
});
