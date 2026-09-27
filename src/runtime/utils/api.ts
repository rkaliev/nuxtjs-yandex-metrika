import type { ModuleOptions, YandexMetrikaApi } from '../types'
import { createApi } from './methods'

export function createRealApi(id: string): YandexMetrikaApi {
  return createApi((method, args) => {
    if (typeof window.ym === 'function') {
      window.ym(id, method, ...args)
    }
  })
}

const INIT_OPTION_KEYS: (keyof ModuleOptions)[] = [
  'accurateTrackBounce',
  'clickmap',
  'defer',
  'ecommerce',
  'trackLinks',
  'triggerEvent',
  'ut',
  'webvisor',
  'trackHash',
  'sendTitle',
  'childIframe',
  'disableYtm',
  'type',
  'params',
  'userParams',
  'trustedDomains',
]

// Empty params, userParams and trustedDomains (the defaults) are left out of init
function isEmpty(value: unknown): boolean {
  if (Array.isArray(value)) return value.length === 0
  return typeof value === 'object' && value !== null && Object.keys(value).length === 0
}

export function buildInitOptions(config: ModuleOptions): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of INIT_OPTION_KEYS) {
    if (config[key] !== undefined && !isEmpty(config[key])) {
      result[key] = config[key]
    }
  }
  return result
}

export function initCounter(id: string, config: ModuleOptions): void {
  window.ym(id, 'init', buildInitOptions(config))
}
