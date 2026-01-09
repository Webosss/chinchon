const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 60 * 1000,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    timeout: 120 * 1000,
    reuseExistingServer: false,
    env: { VITE_WS_URL: 'ws://localhost:4000' }
  },
  globalSetup: require.resolve('./tests/global-setup.cjs'),
  globalTeardown: require.resolve('./tests/global-teardown.cjs'),
})
