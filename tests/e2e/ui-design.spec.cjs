const { test, expect } = require('@playwright/test')

test('new UI design: home page and game layout', async ({ page }) => {
  // Visit home page
  await page.goto('/')
  
  // Verify new home design
  await expect(page.locator('text=🃏 Chinchón')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('text=Juego de cartas')).toBeVisible()
  
  // Create a game
  await page.locator('input').first().fill('Alice')
  await page.getByText('🎮 Crear partida').click()
  
  // Verify game page loads with new layout
  await expect(page.locator('header')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('.tapete')).toBeVisible({ timeout: 5000 })
  
  // Verify top bar has required info
  await expect(page.locator('header').getByText('Sala:')).toBeVisible()
  await expect(page.locator('header').getByText('Turno:')).toBeVisible()
  await expect(page.locator('header').getByText('Ronda:')).toBeVisible()
  
  // Verify game section (main tapete)
  const tapete = page.locator('.tapete')
  await expect(tapete).toBeVisible()
  
  // Verify buttons are visible with new labels
  await expect(page.getByText('📥 Robar mazo')).toBeVisible({ timeout: 5000 })
  await expect(page.getByText('📤 Robar descarte')).toBeVisible()
  await expect(page.getByText('✓ Terminar turno')).toBeVisible()
  await expect(page.getByText('🔒 Cerrar')).toBeVisible()
  await expect(page.getByText('🃏 Repartir')).toBeVisible()
  
  // Verify player hand section at bottom
  await expect(page.locator('text=TU MANO')).toBeVisible()
  
  console.log('✅ New UI design verified successfully')
})
