const getMetrics = () => ({
  width: document.documentElement.clientWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio || 1,
  scrollHeight: document.documentElement.scrollHeight,
})

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message?.type === 'GET_PAGE_METRICS') {
    sendResponse(getMetrics())
    return true
  }

  if (message?.type === 'SCROLL_TO') {
    window.scrollTo(0, message.y || 0)
    sendResponse({ ok: true })
    return true
  }

  return false
})
