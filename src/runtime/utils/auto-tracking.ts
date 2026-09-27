import type { YandexMetrikaApi } from '../types'

export interface RouteLike {
  fullPath: string
}

export interface NavigationRouter {
  afterEach(guard: (to: RouteLike, from: RouteLike, failure?: unknown) => void): unknown
  resolve(fullPath: string): { href: string }
}

export interface PageLifecycle {
  /** Registers `callback` for the moment a navigation has rendered its page */
  onPageReady(callback: () => Promise<void>): unknown
  getTitle(): Promise<string>
}

/**
 * Sends one hit per successful URL change, including the entry page.
 * The URL is recorded on navigation and sent once the page is ready, so the hit carries the new page's title.
 */
export function setupAutoTracking(router: NavigationRouter, page: PageLifecycle, api: YandexMetrikaApi): void {
  let pending: string | undefined
  let lastSent: string | undefined

  // Compared with the last URL, not `from`: the initial navigation replaces a route with itself
  router.afterEach((to, _from, failure) => {
    if (failure) return
    // href includes the router base (app.baseURL); fullPath does not
    const url = router.resolve(to.fullPath).href
    if (url === (pending ?? lastSent)) return
    pending = url
  })

  page.onPageReady(async () => {
    if (pending === undefined) return
    const url = pending
    const referer = lastSent
    pending = undefined
    lastSent = url
    const title = await page.getTitle()
    // The entry page has no referer here: Metrika uses the document's own
    api.hit(url, referer === undefined ? { title } : { referer, title })
  })
}
