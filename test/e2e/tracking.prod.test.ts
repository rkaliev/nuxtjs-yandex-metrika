import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'
import { HIT_LOG, navigateToAbout, openPage } from './helpers'
import type { TrackedPage } from './helpers'

type Page = TrackedPage['page']

const SCRIPT_GLOB = '**/metrika/tag.js'

/**
 * Serves an empty tag.js: the plugin's `ym` stub stays in place,
 * so every counter call is kept in its queue `window.ym.a`.
 */
async function openWithStubbedScript(path: string, requested: string[] = []): Promise<TrackedPage> {
  return openPage(path, page => page.route(SCRIPT_GLOB, (route) => {
    requested.push(route.request().url())
    return route.fulfill({ contentType: 'text/javascript', body: '' })
  }))
}

async function openWithFailingScript(path: string): Promise<TrackedPage> {
  return openPage(path, page => page.route(SCRIPT_GLOB, route => route.abort()))
}

function ymCalls(page: Page): Promise<unknown[][]> {
  return page.evaluate(() => window.ym.a as unknown[][])
}

async function hitCalls(page: Page): Promise<unknown[][]> {
  return (await ymCalls(page)).filter(call => call[1] === 'hit')
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

  // Characterizes current behavior: the entry page is not tracked (fixed in part 3)
  it('should not send a hit for the entry page', async () => {
    const { page } = await openWithStubbedScript('/')

    expect(await hitCalls(page)).toEqual([])

    await page.close()
  })

  it('should send a hit with referer on client-side navigation', async () => {
    const { page } = await openWithStubbedScript('/')

    await navigateToAbout(page)

    await expect.poll(() => hitCalls(page)).toEqual([['99999999', 'hit', '/about', { referer: '/' }]])

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
    const { page, logsWith } = await openWithFailingScript('/')

    await navigateToAbout(page)

    await expect.poll(() => logsWith(HIT_LOG)).toEqual([[HIT_LOG, '/about', { referer: '/' }]])

    await page.close()
  })
})
