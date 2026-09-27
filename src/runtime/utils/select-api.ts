import type { ModuleOptions, YandexMetrikaApi } from '../types'
import { createMockApi } from './mock'
import { createRealApi, initCounter } from './api'
import { createApi } from './methods'
import { loadScript } from './script-loader'
import { SCRIPT_URL, SCRIPT_URL_CDN } from './constants'

export function isCounterEnabled(config: ModuleOptions): boolean {
  return !config.disabled && !!config.id
}

export function selectApi(
  config: Required<ModuleOptions>,
  dev: boolean,
  onConsentGranted?: () => void,
): YandexMetrikaApi {
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
  }

  let target: YandexMetrikaApi
  const start = () => {
    if (dev) {
      target = createMockApi(config.debug)
      return
    }
    target = startCounter(config, (fallback) => {
      target = fallback
    })
  }

  // The mock's grantConsent logs it in dev with debug
  const logGrant = dev ? createMockApi(config.debug).grantConsent : () => {}
  let grantConsent = logGrant
  if (config.requireConsent) {
    // Nothing is loaded, sent or kept until consent
    target = createApi((method) => {
      if (config.debug) console.log(`[nuxt-yandex-metrika] dropped, waiting for consent: ${method}`)
    })
    let granted = false
    grantConsent = () => {
      logGrant()
      if (granted) return
      granted = true
      start()
      onConsentGranted?.()
    }
  }
  else {
    start()
  }

  return createApi((method, args) => (target[method] as (...args: unknown[]) => void)(...args), grantConsent)
}

// Mode 3: production → load the real script in the background, calls queue in the ym stub meanwhile
function startCounter(config: Required<ModuleOptions>, onFailure: (fallback: YandexMetrikaApi) => void): YandexMetrikaApi {
  // A runtime env override reaches the config as a number (Nuxt parses it with destr)
  const id = String(config.id)
  const url = config.useCDN ? SCRIPT_URL_CDN : SCRIPT_URL
  // loadScript installs the ym stub synchronously, so init below is queued first
  loadScript(url).catch((error) => {
    console.error('[nuxt-yandex-metrika] Failed to load Yandex Metrika script. Falling back to mock API.', error)
    onFailure(createMockApi(config.debug))
  })
  initCounter(id, config)
  return createRealApi(id)
}
