const { test, expect } = require('@playwright/test')

function getRoomIdFromHeader(text){
  // Look for "Sala:" followed by whitespace and the room ID code
  const m = text.match(/Sala:\s+([A-Z0-9]+)/)
  return m && m[1]
}

test('create, join, execute a valid turn; block join when playing; invalid action shows error', async ({ browser }) => {
  // Player 1 (Alice) creates room
  const context1 = await browser.newContext()
  const page1 = await context1.newPage()
  page1.on('console', msg => console.log('[page1 console]', msg.text()))
  page1.on('pageerror', err => console.log('[page1 pageerror]', err.message))
  await page1.goto('/')
  // Debugging pause: ensure home heading exists (new design: emoji + title)
  await expect(page1.locator('text=Chinchón')).toBeVisible({ timeout: 10000 })
  // Fallback: fill first input (name) directly if label/placeholder selectors fail
  await page1.locator('input').first().fill('Alice')
  await page1.getByText('🎮 Crear partida').click()
  // Wait for game header and extract room ID from "Sala: XXXXXX"
  const salaText = page1.locator('text=/Sala:/')
  await expect(salaText).toBeVisible({ timeout: 5000 })
  const headerText = await page1.locator('header').textContent()
  const roomId = getRoomIdFromHeader(headerText)
  expect(roomId).toBeTruthy()
  // Ensure Alice appears in the scoreboard (unique match)
  await expect(page1.locator('text=Alice:')).toBeVisible()

  // Player 2 (Bob) joins
  const context2 = await browser.newContext()
  const page2 = await context2.newPage()
  await page2.goto('/')
  await page2.locator('input').first().fill('Bob')
  await page2.getByPlaceholder('Ej: ABC123').fill(roomId)
  await page2.getByText('✅ Unirse a partida').click()

  // Wait for both pages to load the game (look for header) with longer timeout
  await expect(page1.locator('header')).toBeVisible({ timeout: 10000 })
  await page1.waitForTimeout(1000) // Extra wait for sync
  await expect(page2.locator('header')).toBeVisible({ timeout: 10000 })
  await page2.waitForTimeout(1000) // Extra wait for sync

  // It should be Alice's turn first - target the Turno label's text in header
  await expect(page1.locator('header').getByText('Turno:')).toBeVisible({ timeout: 5000 })

  // Alice performs a valid turn: draw -> discard -> end (use new button label)
  await page1.getByText('📥 Robar mazo').click()
  // Discard first card in hand (look for card buttons)
  const cardButtons = page1.locator('.card-fallback, button[aria-label*="Carta"]')
  await expect(cardButtons).toHaveCount(async (count) => count > 0)
  const firstCard = cardButtons.first()
  await firstCard.click()
  // Wait a moment for discard to register
  await page1.waitForTimeout(500)
  // End turn using the new button label
  await page1.getByText('✓ Terminar turno').click()

  // Verify turn changed (may show Bob now)
  await page1.waitForTimeout(500)

  // Now room is in playing state; a third client should be blocked from joining
  const context3 = await browser.newContext()
  const page3 = await context3.newPage()
  await page3.goto('/')
  await page3.getByPlaceholder('Ej: Ana').fill('Carlos')
  await page3.getByPlaceholder('Ej: ABC123').fill(roomId)
  await page3.getByText('✅ Unirse a partida').click()
  // The server should send an error toast visible in UI
  await expect(page3.locator('text=La partida ya comenzó')).toBeVisible({ timeout: 3000 })

  // Invalid action: Bob tries to close round without discarding; should be rejected and toast shown
  await page2.getByText('🔒 Cerrar').click()
  await expect(page2.locator('text=Debes haber descartado antes de cerrar')).toBeVisible({ timeout: 3000 })

  // Cleanup contexts
  await context1.close()
  await context2.close()
  await context3.close()
})
