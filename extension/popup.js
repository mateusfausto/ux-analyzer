const currentUrlEl = document.getElementById('currentUrl')
const apiBaseInput = document.getElementById('apiBase')
const analyzeButton = document.getElementById('analyze')
const statusEl = document.getElementById('status')
const DEFAULT_API_BASE = 'https://uxanalyzer.onrender.com'
let apiBase = DEFAULT_API_BASE

const setStatus = (message) => {
  statusEl.textContent = message
}

const loadApiBase = () => {
  chrome.storage.local.get(['apiBase'], (result) => {
    apiBase = (result.apiBase || DEFAULT_API_BASE).trim()
    apiBaseInput.value = apiBase
  })
}

const persistApiBase = () => {
  const value = apiBaseInput.value.trim()
  apiBase = value || DEFAULT_API_BASE
  chrome.storage.local.set({ apiBase })
}

const loadCurrentTab = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0]
    currentUrlEl.textContent = tab?.url || 'URL indisponível'
  })
}

const analyzeCurrentTab = async () => {
  setStatus('Capturando página inteira...')
  analyzeButton.disabled = true

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) {
    setStatus('Aba não encontrada')
    analyzeButton.disabled = false
    return
  }

  chrome.runtime.sendMessage({ type: 'CAPTURE_FULL_PAGE', tabId: tab.id }, async (response) => {
    if (!response?.ok) {
      setStatus(response?.error || 'Erro ao capturar a página')
      analyzeButton.disabled = false
      return
    }

    const { screenshots, width, height, pixelRatio, totalHeight } = response.result

    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(width * pixelRatio)
    canvas.height = Math.floor(totalHeight * pixelRatio)
    const context = canvas.getContext('2d')

    const loadImage = (dataUrl) =>
      new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = dataUrl
      })

    for (const shot of screenshots) {
      const img = await loadImage(shot.dataUrl)
      const y = Math.floor(shot.y * pixelRatio)
      context.drawImage(img, 0, y, canvas.width, Math.floor(height * pixelRatio))
    }

    const resolvedApiBase = apiBaseInput.value.trim() || apiBase || DEFAULT_API_BASE
    persistApiBase()
    const imageBase64 = canvas.toDataURL('image/png').split(',')[1]

    try {
      setStatus('Enviando para análise...')
      const response = await fetch(`${resolvedApiBase}/api/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageBase64,
          url: currentUrlEl.textContent,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        setStatus(`Erro na análise: ${errorText}`)
        analyzeButton.disabled = false
        return
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      chrome.downloads.download({
        url: blobUrl,
        filename: `analise-ux-${Date.now()}.pdf`,
        saveAs: true,
      })

      setStatus('Relatório gerado')
    } catch (error) {
      setStatus('Erro ao conectar com a API')
    } finally {
      analyzeButton.disabled = false
    }
  })
}

analyzeButton.addEventListener('click', analyzeCurrentTab)
apiBaseInput.addEventListener('change', persistApiBase)

loadApiBase()
loadCurrentTab()
