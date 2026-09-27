import type { ModuleOptions, YandexMetrikaApi } from '../types'
import { createMockApi } from './mock'
import { createRealApi, initCounter } from './api'
import { loadScript } from './script-loader'
import { SCRIPT_URL, SCRIPT_URL_CDN } from './constants'

export function isCounterEnabled(config: ModuleOptions): boolean {
  return !config.disabled && !!config.id
}

export async function selectApi(config: Required<ModuleOptions>, dev: boolean): Promise<YandexMetrikaApi> {
  // Mode 1: disabled or no ID → mock
  if (!isCounterEnabled(config)) {
    // Production builds already warned at build time
    if (!config.id && dev) {
      console.warn('[nuxt-yandex-metrika] Counter ID is not set. Using mock API.')
    }
    return createMockApi(config.debug)
  }

  // Mode 2: development → mock with optional debug
  if (dev) {
    console.warn('[nuxt-yandex-metrika] Development mode: using mock API.')
    if (config.debug) {
      console.warn('[nuxt-yandex-metrika] Debug is enabled: you\'ll see all API calls in the console.')
    }
    return createMockApi(config.debug)
  }

  // Mode 3: production → load real script
  try {
    const url = config.useCDN ? SCRIPT_URL_CDN : SCRIPT_URL
    await loadScript(url)
    initCounter(config.id, config)
    return createRealApi(config.id)
  }
  catch (error) {
    console.error('[nuxt-yandex-metrika] Failed to load Yandex Metrika script. Falling back to mock API.', error)
    return createMockApi(config.debug)
  }
}
