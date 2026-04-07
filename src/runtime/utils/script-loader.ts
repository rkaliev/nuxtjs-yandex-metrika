declare global {
  interface Window {
    ym: ((...args: unknown[]) => void) & { a?: unknown[]; l?: number }
  }
}

export function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create ym stub that queues calls
    if (typeof window.ym !== 'function') {
      window.ym = function (...args: unknown[]) {
        (window.ym.a = window.ym.a || []).push(args)
      }
      window.ym.l = Date.now()
    }

    const script = document.createElement('script')
    script.async = true
    script.src = url

    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`[nuxt-yandex-metrika] Failed to load script: ${url}`))

    const firstScript = document.getElementsByTagName('script')[0]
    firstScript?.parentNode?.insertBefore(script, firstScript)
      ?? document.head.appendChild(script)
  })
}
