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
