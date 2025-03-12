import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  use: {
    headless: true
  },
  testDir: ".",
  reporter: [ ['html', { open: 'never' }] ],
  projects:[
    {
      name: "Json-runner",
      testDir: './node_modules/playwright-json-runner/dist/',
      testMatch: 'runner-playwright.js',
    }
  ]
});
