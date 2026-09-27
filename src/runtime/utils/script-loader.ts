import { SCRIPT_URL, SCRIPT_URL_CDN } from './constants'

// Either source defines ym; the official snippet adds `?id=<counter>` to the URL
const LOADED_SCRIPT_SELECTOR = [SCRIPT_URL, SCRIPT_URL_CDN]
  .flatMap(url => [`script[src="${url}"]`, `script[src^="${url}?"]`])
  .join(', ')

export function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create ym stub that queues calls
    if (typeof window.ym !== 'function') {
      window.ym = function (...args: unknown[]) {
        (window.ym.a = window.ym.a || []).push(args)
      }
      window.ym.l = Date.now()
    }

    // Already on the page (e.g. a second plugin run or the official snippet): don't load it twice
    if (document.querySelector(LOADED_SCRIPT_SELECTOR)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = url

    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`[nuxt-yandex-metrika] Failed to load script: ${url}`))

    const firstScript = document.getElementsByTagName('script')[0]
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    }
    else {
      document.head.appendChild(script)
    }
  })
}
