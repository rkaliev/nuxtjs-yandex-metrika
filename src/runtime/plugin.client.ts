import { defineNuxtPlugin, injectHead, useRuntimeConfig, useRouter } from '#imports'
import type { Plugin } from '#app'
import type { YandexMetrikaApi } from './types'
import { isCounterEnabled, selectApi } from './utils/select-api'
import { setupAutoTracking } from './utils/auto-tracking'
import { createHeadRender } from './utils/head-render'

// Annotated: the inferred type names a Nuxt-internal path, and the generated declaration must type $yandexMetrika
const plugin: Plugin<{ yandexMetrika: YandexMetrikaApi }> = defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.yandexMetrika
  const api = selectApi(config, import.meta.dev)

  if (config.autoTracking && isCounterEnabled(config)) {
    const { nextHeadRender, headRendered } = createHeadRender(injectHead())

    const router = useRouter()
    // Opened at a URL other than the prerendered payload's (a query or hash), Nuxt first hydrates the payload route
    const payloadPath = nuxtApp.payload.prerenderedAt ? nuxtApp.payload.path : undefined
    const initialFullPath = router.currentRoute.value.fullPath

    setupAutoTracking(router, {
      onPageReady: (callback) => {
        // Never returned to Nuxt: its hooks await their handlers, and hydration would wait for the hit
        const flush = () => {
          void callback()
        }
        // Extra signals are harmless: the pending hit is taken once
        let pageRendering = false
        nuxtApp.hook('page:start', () => {
          pageRendering = true
        })
        nuxtApp.hook('page:finish', () => {
          pageRendering = false
          flush()
        })
        // Only the query changed: no page:start/page:finish, but page:loading:end fires.
        // A failed navigation also fires it: ignore it while a page renders, or the hit gets the old title
        nuxtApp.hook('page:loading:end', () => {
          if (!pageRendering) flush()
        })
        // The entry page
        nuxtApp.hook('app:suspense:resolve', flush)
        // An error page (e.g. a client-side 404) replaces the page without any page hook: wait for its head.
        // unhead v3 first renders updates queued before the error, so wait for a render after the error page's update
        // (Nuxt's default error page loads its content lazily, after app:error)
        nuxtApp.hook('app:error', () => {
          void nextHeadRender(true).then(callback)
        })
      },
      // sendTitle: false keeps titles out of Metrika, including the ones auto-tracking would pass
      ...(config.sendTitle !== false && {
        getTitle: async () => {
          // While hydrating, head rendering is paused until hydration ends, and the SSR title is already in place
          if (!nuxtApp.isHydrating) await headRendered()
          return document.title
        },
      }),
      isHydrationPlaceholder: fullPath =>
        !!nuxtApp.isHydrating && fullPath === payloadPath && fullPath !== initialFullPath,
    }, api)
  }

  return { provide: { yandexMetrika: api } }
})

export default plugin
