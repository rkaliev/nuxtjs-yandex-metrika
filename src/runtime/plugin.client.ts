import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#imports'
import { isCounterEnabled, selectApi } from './utils/select-api'
import { setupAutoTracking } from './utils/auto-tracking'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public.yandexMetrika
  const router = useRouter()
  const api = selectApi(config, import.meta.dev)

  if (config.autoTracking && isCounterEnabled(config)) {
    setupAutoTracking(router, api)
  }

  return { provide: { yandexMetrika: api } }
})
