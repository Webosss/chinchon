const { chromium } = require('playwright')
;(async()=>{
  const browser = await chromium.launch()
  const page = await (await browser.newContext()).newPage()
  await page.goto('http://localhost:5173')
  await page.waitForTimeout(2000)
  const cnt = await page.locator('input[placeholder="Ej: Ana"]').count()
  console.log('count', cnt)
  try{ console.log(await page.locator('main').innerHTML()) }catch(e){ console.error('main not found', e.message) }
  await browser.close()
})().catch(e=>{ console.error(e); process.exit(1) })
