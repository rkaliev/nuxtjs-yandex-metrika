import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#imports'
import type { YandexMetrikaApi } from './types'
import { createMockApi } from './utils/mock'
import { createRealApi, buildInitOptions } from './utils/api'
import { loadScript } from './utils/script-loader'
import { SCRIPT_URL, SCRIPT_URL_CDN } from './utils/constants'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig().public.yandexMetrika
  const router = useRouter()
  let api: YandexMetrikaApi

  // Mode 1: disabled or no ID → mock
  if (config.disabled || !config.id) {
    if (!config.id) {
      console.warn('[nuxt-yandex-metrika] Counter ID is not set. Using mock API.')
    }
    api = createMockApi(config.debug)
    return { provide: { yandexMetrika: api } }
  }

  // Mode 2: development → mock with optional debug
  if (import.meta.dev) {
    console.warn('[nuxt-yandex-metrika] Development mode: using mock API.')
    if (config.debug) {
      console.warn("[nuxt-yandex-metrika] Debug is enabled: you'll see all API calls in the console.")
    }
    api = createMockApi(config.debug)
  } else {
    // Mode 3: production → load real script
    try {
      const url = config.useCDN ? SCRIPT_URL_CDN : SCRIPT_URL
      await loadScript(url)
      window.ym(config.id, 'init', buildInitOptions(config))
      api = createRealApi(config.id)
    } catch (error) {
      console.error('[nuxt-yandex-metrika] Failed to load Yandex Metrika script. Falling back to mock API.', error)
      api = createMockApi(config.debug)
    }
  }

  // Auto-tracking: track page navigations
  if (config.autoTracking) {
    let isInitialNavigation = true
    router.afterEach((to: { fullPath: string }, from: { fullPath: string }) => {
      if (isInitialNavigation) {
        isInitialNavigation = false
        return
      }
      api.hit(to.fullPath, { referer: from.fullPath })
    })
  }

  return { provide: { yandexMetrika: api } }
})
