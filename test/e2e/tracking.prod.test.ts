import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'
import { HIT_LOG, SCRIPT_GLOB, hitCalls, navigateToAbout, openPage, openWithStubbedScript, ymCalls } from './helpers'
import type { TrackedPage } from './helpers'

type Page = TrackedPage['page']
type Route = Parameters<Parameters<Page['route']>[1]>[0]

async function openWithFailingScript(path: string): Promise<TrackedPage> {
  return openPage(path, page => page.route(SCRIPT_GLOB, route => route.abort()))
}

describe('e2e tracking in production', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground', import.meta.url)),
    browser: true,
    dev: false,
    nuxtConfig: {
      yandexMetrika: {
        id: '99999999',
        debug: true,
      },
    },
  })

  it('should request the script from mc.yandex.ru', async () => {
    const requested: string[] = []
    const { page } = await openWithStubbedScript('/', requested)

    expect(requested).toEqual(['https://mc.yandex.ru/metrika/tag.js'])

    await page.close()
  })

  it('should init the counter with the configured options', async () => {
    const { page } = await openWithStubbedScript('/')

    expect((await ymCalls(page))[0]).toEqual(['99999999', 'init', {
      accurateTrackBounce: true,
      clickmap: true,
      defer: true,
      ecommerce: false,
      trackLinks: true,
      triggerEvent: true,
      ut: 'noindex',
      webvisor: false,
    }])

    await page.close()
  })

  it('should not wait for tag.js before hydration', async () => {
    let held: Route | undefined
    // tag.js never answers until the end of the test; openPage waits for hydration
    const { page } = await openPage('/', page => page.route(SCRIPT_GLOB, (route) => {
      held = route
    }))

    expect((await ymCalls(page))[0]?.[1]).toBe('init')

    await held?.fulfill({ contentType: 'text/javascript', body: '' })
    await page.close()
  })

  it('should finish hydration without waiting for the hit', async () => {
    const { page } = await openPage('/', async (page) => {
      await page.route(SCRIPT_GLOB, route => route.fulfill({ contentType: 'text/javascript', body: '' }))
      // Records when Nuxt reports the end of hydration
      await page.addInitScript(() => {
        const w = window as unknown as { useNuxtApp?: () => { isHydrating?: boolean }, hydratedAt?: number }
        const check = () => {
          try {
            if (w.useNuxtApp?.().isHydrating === false) {
              w.hydratedAt = performance.now()
              return
            }
          }
          catch {
            // The Nuxt app does not exist yet
          }
          requestAnimationFrame(check)
        }
        requestAnimationFrame(check)
      })
    })

    const { hydratedAt, domContentLoaded } = await page.evaluate(() => ({
      hydratedAt: (window as unknown as { hydratedAt: number }).hydratedAt,
      domContentLoaded: (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).domContentLoadedEventEnd,
    }))
    // Without the fix hydration ended only at the 1000 ms head render timeout
    expect(hydratedAt - domContentLoaded).toBeLessThan(500)

    await page.close()
  })

  it('should send a hit with the title for the entry page', async () => {
    const { page } = await openWithStubbedScript('/')

    await expect.poll(() => hitCalls(page)).toEqual([['99999999', 'hit', '/', { title: 'Home' }]])

    await page.close()
  })

  it('should send a hit with referer on client-side navigation', async () => {
    const { page } = await openWithStubbedScript('/')

    await navigateToAbout(page)

    await expect.poll(() => hitCalls(page)).toEqual([
      ['99999999', 'hit', '/', { title: 'Home' }],
      ['99999999', 'hit', '/about', { referer: '/', title: 'About' }],
    ])

    await page.close()
  })

  it('should log an error when the script fails to load', async () => {
    const { page, consoleArgs } = await openWithFailingScript('/')

    await expect.poll(() => consoleArgs.some(args =>
      String(args[0]).includes('Failed to load Yandex Metrika script. Falling back to mock API.'),
    )).toBe(true)

    await page.close()
  })

  it('should use the mock api after a failed script load', async () => {
    const { page, consoleArgs, logsWith } = await openWithFailingScript('/')
    // The load runs in the background: navigate only after the switch to the mock
    await expect.poll(() => consoleArgs.some(args =>
      String(args[0]).includes('Failed to load Yandex Metrika script. Falling back to mock API.'),
    )).toBe(true)

    await navigateToAbout(page)

    // The entry hit may land in the ym queue or the mock, depending on when the load failed
    await expect.poll(() => logsWith(HIT_LOG)).toContainEqual([HIT_LOG, '/about', { referer: '/', title: 'About' }])

    await page.close()
  })
})
