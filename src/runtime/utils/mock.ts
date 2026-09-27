import type { YandexMetrikaApi } from '../types'
import { createApi } from './methods'

const LOG_PREFIX = '[nuxt-yandex-metrika]'

export function createMockApi(debug: boolean): YandexMetrikaApi {
  return createApi((method, args) => {
    if (debug) {
      console.log(`${LOG_PREFIX} ${method}:`, ...args)
    }
  }, () => {
    if (debug) {
      console.log(`${LOG_PREFIX} grantConsent`)
    }
  })
}

export function createNoopApi(): YandexMetrikaApi {
  return createApi(() => {})
}
