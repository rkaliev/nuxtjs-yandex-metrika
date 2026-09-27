import { defineNuxtPlugin, injectHead, useRuntimeConfig, useRouter } from '#imports'
import { isCounterEnabled, selectApi } from './utils/select-api'
import { setupAutoTracking } from './utils/auto-tracking'

// Safety net in case a pending head render never happens
const HEAD_RENDER_TIMEOUT_MS = 1000

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.yandexMetrika
  const api = selectApi(config, import.meta.dev)

  if (config.autoTracking && isCounterEnabled(config)) {
    const head = injectHead()

    // Nuxt renders the head after page:finish without awaiting it; `dirty` means that render is still pending
    const headRendered = (): Promise<void> => {
      if (!head.dirty) return Promise.resolve()
      return new Promise((resolve) => {
        const done = () => {
          clearTimeout(timer)
          off()
          resolve()
        }
        const timer = setTimeout(done, HEAD_RENDER_TIMEOUT_MS)
        const off = head.hooks.hook('dom:rendered', done)
      })
    }

    setupAutoTracking(useRouter(), {
      onPageReady: (callback) => {
        // page:loading:end also fires when only the query changes (no page:finish then);
        // app:suspense:resolve covers the entry page, including apps without <NuxtPage>
        nuxtApp.hook('page:loading:end', callback)
        nuxtApp.hook('app:suspense:resolve', callback)
      },
      getTitle: async () => {
        await headRendered()
        return document.title
      },
    }, api)
  }

  return { provide: { yandexMetrika: api } }
})
