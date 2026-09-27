import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#imports'
import { isCounterEnabled, selectApi } from './utils/select-api'
import { setupAutoTracking } from './utils/auto-tracking'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig().public.yandexMetrika
  // Before await: the Nuxt context is lost after it
  const router = useRouter()
  const api = await selectApi(config, import.meta.dev)

  if (config.autoTracking && isCounterEnabled(config)) {
    setupAutoTracking(router, api)
  }

  return { provide: { yandexMetrika: api } }
})
