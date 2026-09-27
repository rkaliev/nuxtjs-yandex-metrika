import { createPage, url } from '@nuxt/test-utils/e2e'

type Page = Awaited<ReturnType<typeof createPage>>

export const HIT_LOG = '[nuxt-yandex-metrika] hit:'

export interface TrackedPage {
  page: Page
  /** Arguments of every console message, in order */
  consoleArgs: unknown[][]
  /** Arguments of console messages whose first argument is `prefix` */
  logsWith(prefix: string): unknown[][]
  /** Resolves once every console message received so far has its arguments; await before negative checks */
  settled(): Promise<void>
}

/**
 * Opens `path` and waits for hydration. The console listener and `beforeGoto`
 * (e.g. `page.route`) run before navigation so nothing from page load is missed.
 */
export async function openPage(path: string, beforeGoto?: (page: Page) => Promise<unknown>): Promise<TrackedPage> {
  const page = await createPage()
  const consoleArgs: unknown[][] = []
  const pending: Promise<unknown>[] = []

  page.on('console', (msg) => {
    const entry: unknown[] = []
    consoleArgs.push(entry)
    pending.push(Promise.all(msg.args().map(arg => arg.jsonValue())).then(values => entry.push(...values)))
  })

  await beforeGoto?.(page)
  await page.goto(url(path), { waitUntil: 'hydration' })

  return {
    page,
    consoleArgs,
    logsWith: prefix => consoleArgs.filter(args => args[0] === prefix),
    settled: async () => {
      await Promise.all(pending)
    },
  }
}

export async function navigateToAbout(page: Page): Promise<void> {
  await page.click('a[href="/about"]')
  await page.waitForURL('**/about')
}

export const SCRIPT_GLOB = '**/metrika/tag.js'

/**
 * Serves an empty tag.js: the plugin's `ym` stub stays in place,
 * so every counter call is kept in its queue `window.ym.a`.
 */
export async function openWithStubbedScript(path: string, requested: string[] = []): Promise<TrackedPage> {
  return openPage(path, page => page.route(SCRIPT_GLOB, (route) => {
    requested.push(route.request().url())
    return route.fulfill({ contentType: 'text/javascript', body: '' })
  }))
}

export function ymCalls(page: Page): Promise<unknown[][]> {
  return page.evaluate(() => window.ym.a as unknown[][])
}

export async function hitCalls(page: Page): Promise<unknown[][]> {
  return (await ymCalls(page)).filter(call => call[1] === 'hit')
}

/** Runs `router.push` for each path in order, awaiting each, inside the page */
export async function pushRoutes(page: Page, paths: string[]): Promise<void> {
  await page.evaluate(async (paths) => {
    const app = (document.querySelector('#__nuxt') as unknown as { __vue_app__: { config: { globalProperties: { $router: { push(path: string): Promise<unknown> } } } } }).__vue_app__
    for (const path of paths) {
      await app.config.globalProperties.$router.push(path)
    }
  }, paths)
}

/** Calls `$yandexMetrika.grantConsent()` inside the page, as a cookie banner would */
export async function grantConsent(page: Page): Promise<void> {
  await page.evaluate(() => {
    const app = (document.querySelector('#__nuxt') as unknown as { __vue_app__: { config: { globalProperties: { $yandexMetrika: { grantConsent(): void } } } } }).__vue_app__
    app.config.globalProperties.$yandexMetrika.grantConsent()
  })
}
