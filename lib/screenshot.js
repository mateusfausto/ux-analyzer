import puppeteer from 'puppeteer'

export async function captureScreenshot(url) {
  let browser

  try {
    const urlObj = new URL(url)
    if (!urlObj.protocol.startsWith('http')) {
      throw new Error('URL inválida')
    }

    console.log(`Capturando screenshot de: ${url}`)

    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath,
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 })
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

    const buffer = await page.screenshot({ type: 'png', fullPage: true })
    if (!buffer || buffer.length < 5000) {
      throw new Error('Screenshot vazio ou muito pequeno')
    }

    return buffer.toString('base64')
  } catch (error) {
    console.error('Erro ao capturar screenshot:', error)
    throw new Error('Falha ao capturar screenshot da URL fornecida')
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
