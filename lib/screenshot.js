import puppeteer from 'puppeteer'
import fs from 'fs'

const getExecutablePath = () => {
  const primaryPath = process.env.PUPPETEER_EXECUTABLE_PATH
  if (primaryPath && fs.existsSync(primaryPath)) {
    return primaryPath
  }

  const fallbackPath = process.env.PUPPETEER_EXECUTABLE_PATH_FALLBACK
  if (fallbackPath && fs.existsSync(fallbackPath)) {
    return fallbackPath
  }

  return undefined
}

export async function captureScreenshot(url) {
  let browser

  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`
    }

    const urlObj = new URL(url)
    if (!urlObj.protocol.startsWith('http')) {
      throw new Error('URL inválida')
    }

    console.log(`Capturando screenshot de: ${url}`)

    const executablePath = getExecutablePath()
    const navigationTimeout = Number(process.env.PUPPETEER_NAV_TIMEOUT_MS || 120000)
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      executablePath,
    }

    try {
      browser = await puppeteer.launch(launchOptions)
    } catch (launchError) {
      if (executablePath) {
        browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })
      } else {
        throw launchError
      }
    }

    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(navigationTimeout)
    page.setDefaultTimeout(navigationTimeout)
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 })
    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      const resourceType = request.resourceType()
      if (resourceType === 'image' || resourceType === 'media' || resourceType === 'font') {
        request.abort()
      } else {
        request.continue()
      }
    })
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: navigationTimeout })
    } catch (error) {
      await page.goto(url, { waitUntil: 'load', timeout: Math.max(navigationTimeout, 150000) })
    }

    // ✅ CORREÇÃO: Substituído page.waitForTimeout por setTimeout com Promise
    await new Promise(resolve => setTimeout(resolve, 1500))

    const buffer = await page.screenshot({ type: 'png', fullPage: true })
    if (!buffer || buffer.length < 5000) {
      throw new Error('Screenshot vazio ou muito pequeno')
    }

    return buffer.toString('base64')
  } catch (error) {
    console.error('Erro ao capturar screenshot:', error)
    const message = error instanceof Error ? error.message : 'Falha ao capturar screenshot da URL fornecida'
    throw new Error(message)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}