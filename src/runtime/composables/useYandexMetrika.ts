import { useNuxtApp } from '#imports'
import type { YandexMetrikaApi } from '../types'
import { createNoopApi } from '../utils/mock'

export function useYandexMetrika(): YandexMetrikaApi {
  if (import.meta.server) {
    return createNoopApi()
  }
  return useNuxtApp().$yandexMetrika
}
