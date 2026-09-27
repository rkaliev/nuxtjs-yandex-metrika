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

    const nextHeadRender = (): Promise<void> =>
      new Promise((resolve) => {
        const done = () => {
          clearTimeout(timer)
          off()
          // A macrotask later: unhead clears `dirty` in a finally that runs after dom:rendered
          setTimeout(resolve)
        }
        const timer = setTimeout(done, HEAD_RENDER_TIMEOUT_MS)
        const off = head.hooks.hook('dom:rendered', done)
      })
    // Nuxt renders the head after page:finish without awaiting it; `dirty` means that render is still pending
    const headRendered = (): Promise<void> => head.dirty ? nextHeadRender() : Promise.resolve()

    const router = useRouter()
    // Opened at a URL other than the prerendered payload's (a query or hash), Nuxt first hydrates the payload route
    const payloadPath = nuxtApp.payload.prerenderedAt ? nuxtApp.payload.path : undefined
    const initialFullPath = router.currentRoute.value.fullPath

    setupAutoTracking(router, {
      onPageReady: (callback) => {
        // Extra signals are harmless: the pending hit is taken once
        let pageRendering = false
        nuxtApp.hook('page:start', () => {
          pageRendering = true
        })
        nuxtApp.hook('page:finish', () => {
          pageRendering = false
          return callback()
        })
        // Only the query changed: no page:start/page:finish, but page:loading:end fires.
        // A failed navigation also fires it: ignore it while a page renders, or the hit gets the old title
        nuxtApp.hook('page:loading:end', () => pageRendering ? undefined : callback())
        // The entry page
        nuxtApp.hook('app:suspense:resolve', callback)
        // An error page (e.g. a client-side 404) replaces the page without any page hook: wait for its head
        nuxtApp.hook('app:error', async () => {
          await nextHeadRender()
          await callback()
        })
      },
      getTitle: async () => {
        await headRendered()
        return document.title
      },
      isHydrationPlaceholder: fullPath =>
        !!nuxtApp.isHydrating && fullPath === payloadPath && fullPath !== initialFullPath,
    }, api)
  }

  return { provide: { yandexMetrika: api } }
})
