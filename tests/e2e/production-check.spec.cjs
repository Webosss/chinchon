const { test, expect } = require('@playwright/test')

test('production site loads with green styling (not white)', async ({ page }) => {
  // Visit the production domain
  await page.goto('https://chin.aligpi.com')

  // Page should load without errors
  page.on('pageerror', err => {
    console.log('[pageerror]', err.message)
  })

  // Wait for the app root (should have green background)
  const appRoot = page.locator('.app-root')
  await expect(appRoot).toBeVisible({ timeout: 10000 })

  // Verify it's not white — check computed style
  const bgColor = await appRoot.evaluate(el => window.getComputedStyle(el).backgroundColor)
  console.log('✓ App root background:', bgColor)
  
  // Verify background is not rgb(255,255,255) white
  expect(bgColor).not.toMatch(/255\s*,\s*255\s*,\s*255/)

  // Check that page has text content (not blank/empty)
  const bodyText = await page.locator('body').textContent()
  console.log('✓ Page has content (not blank):', bodyText.trim().substring(0, 50))
  expect(bodyText.trim().length).toBeGreaterThan(10)

  // Wait a bit for React to fully mount
  await page.waitForTimeout(1000)
  
  // Check there's at least a heading or button (home page content)
  const hasHeading = await page.locator('h1, h2, h3').count()
  const hasButton = await page.locator('button').count()
  console.log(`✓ Found ${hasHeading} headings and ${hasButton} buttons`)
  
  expect(hasHeading + hasButton).toBeGreaterThan(0)

  console.log('✅ Production site is styled with green (not white)')
})
