import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    headless: true,
    trace: 'on',
  },
  testDir: "tests",
  reporter: [ ['html', { open: 'never' }] ],
  projects:[
    {
      name: "Json-runner",
      testDir: './node_modules/playwright-json-runner/dist/',
      testMatch: 'runner-playwright.js',
    }
  ]
});
