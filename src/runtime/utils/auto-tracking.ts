import type { YandexMetrikaApi } from '../types'

export interface NavigationRouter {
  afterEach(guard: (to: { fullPath: string }, from: { fullPath: string }) => void): unknown
}

export function setupAutoTracking(router: NavigationRouter, api: YandexMetrikaApi): void {
  let isInitialNavigation = true
  router.afterEach((to, from) => {
    if (isInitialNavigation) {
      isInitialNavigation = false
      return
    }
    api.hit(to.fullPath, { referer: from.fullPath })
  })
}
