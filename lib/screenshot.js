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
    const urlObj = new URL(url)
    if (!urlObj.protocol.startsWith('http')) {
      throw new Error('URL inválida')
    }

    console.log(`Capturando screenshot de: ${url}`)

    const executablePath = getExecutablePath()
    const launchOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
