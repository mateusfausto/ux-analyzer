const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const ensureContentScript = async (tabId) => {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_METRICS' })
    return true
  } catch (error) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['contentScript.js'],
      })
      await chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_METRICS' })
      return true
    } catch (injectionError) {
      return false
    }
  }
}

const captureFullPage = async (tabId) => {
  const canAccess = await ensureContentScript(tabId)
  if (!canAccess) {
    throw new Error('Não foi possível acessar a página para capturar')
  }

  const metrics = await chrome.tabs.sendMessage(tabId, {
    type: 'GET_PAGE_METRICS',
  })

  const { width, height, pixelRatio, scrollHeight } = metrics

  const screenshots = []
  const viewportHeight = height
  const totalHeight = scrollHeight

  for (let y = 0; y < totalHeight; y += viewportHeight) {
    await chrome.tabs.sendMessage(tabId, {
      type: 'SCROLL_TO',
      y,
    })

    await wait(400)

    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' })
    if (!dataUrl) {
      throw new Error('Falha ao capturar o conteúdo visível')
    }
    screenshots.push({ dataUrl, y })
    await wait(400)
  }

  await chrome.tabs.sendMessage(tabId, { type: 'SCROLL_TO', y: 0 })

  return { screenshots, width, height, pixelRatio, totalHeight }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'CAPTURE_FULL_PAGE') {
    const tabId = message?.tabId || sender?.tab?.id

    if (!tabId) {
      sendResponse({ ok: false, error: 'Aba não encontrada' })
      return false
    }

    captureFullPage(tabId)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: error?.message || 'Erro ao capturar' }))

    return true
  }

  return false
})
