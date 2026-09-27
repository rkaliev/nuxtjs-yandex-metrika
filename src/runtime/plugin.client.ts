import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#imports'
import { isCounterEnabled, selectApi } from './utils/select-api'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig().public.yandexMetrika
  const router = useRouter()
  const api = await selectApi(config, import.meta.dev)

  // Auto-tracking: track page navigations
  if (config.autoTracking && isCounterEnabled(config)) {
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
