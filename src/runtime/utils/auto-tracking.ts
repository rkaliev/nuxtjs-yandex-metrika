import type { HitOptions, YandexMetrikaApi } from '../types'

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
  /** Absent when titles must not be sent (`sendTitle: false`) */
  getTitle?(): Promise<string>
  /** True for a route rendered only to hydrate a prerendered payload before the real URL replaces it */
  isHydrationPlaceholder(fullPath: string): boolean
}

/**
 * Sends one hit per successful URL change, including the entry page.
 * The URL is recorded on navigation and sent once the page is ready, so the hit carries the new page's title.
 */
export interface AutoTracking {
  /** Sends the current page once consent is granted; pages before it are never sent, not even as referer */
  onConsentGranted(): void
}

export function setupAutoTracking(router: NavigationRouter, page: PageLifecycle, api: YandexMetrikaApi): AutoTracking {
  let pending: string | undefined
  let lastSent: string | undefined

  // Compared with the last URL, not `from`: the initial navigation replaces a route with itself
  router.afterEach((to, _from, failure) => {
    if (failure || page.isHydrationPlaceholder(to.fullPath)) return
    // href includes the router base (app.baseURL); fullPath does not
    const url = router.resolve(to.fullPath).href
    if (url === pending) return
    // Back on the last sent page before the pending one rendered: nothing new to send
    pending = url === lastSent ? undefined : url
  })

  // The hit being sent; consent while it awaits the title takes away its pre-consent referer
  let inFlight: { referer: string | undefined } | undefined

  const send = async (url: string, current: { referer: string | undefined }) => {
    // Without getTitle the hit goes out right away, with no wait for the head
    const title = page.getTitle ? await page.getTitle() : undefined
    // The entry page has no referer here: Metrika uses the document's own
    const options: HitOptions = current.referer === undefined ? {} : { referer: current.referer }
    if (title !== undefined) options.title = title
    api.hit(url, options)
  }

  page.onPageReady(async () => {
    if (pending === undefined) return
    const url = pending
    const current = { referer: lastSent }
    pending = undefined
    lastSent = url
    inFlight = current
    await send(url, current)
    if (inFlight === current) inFlight = undefined
  })

  let consented = false
  return {
    onConsentGranted: () => {
      if (consented) return
      consented = true
      // Hits before consent were dropped: the page being rendered or sent goes out as the entry page, without referer
      if (pending !== undefined) lastSent = undefined
      else if (inFlight) inFlight.referer = undefined
      else if (lastSent !== undefined) void send(lastSent, { referer: undefined })
    },
  }
}
