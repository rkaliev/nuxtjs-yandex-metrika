import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'
import { HIT_LOG, navigateToAbout, openPage } from './helpers'
import type { TrackedPage } from './helpers'

/**
 * Aborts tag.js so the real script never loads. If the counter wrongly fell through to the real path,
 * the plugin would fall back to the mock API, whose hit logs the tests below would catch.
 */
function openWithBlockedScript(path: string, requested: string[] = []): Promise<TrackedPage> {
  return openPage(path, page => page.route('**/metrika/tag.js', (route) => {
    requested.push(route.request().url())
    return route.abort()
  }))
}

describe('e2e tracking when disabled', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground', import.meta.url)),
    browser: true,
    // Production build: in dev mode test-utils runs `nuxi _dev` in playground, which ignores `nuxtConfig`.
    // The disabled branch runs before the dev/prod check, so it takes the same path in both modes.
    dev: false,
    nuxtConfig: {
      yandexMetrika: {
        id: '99999999',
        debug: true,
        disabled: true,
      },
    },
  })

  it('should not log hits when the counter is disabled', async () => {
    const { page, logsWith, settled } = await openWithBlockedScript('/')

    await navigateToAbout(page)
    // A negative check has no event to wait for: give the router guards time to run
    await page.waitForTimeout(500)

    await settled()
    expect(logsWith(HIT_LOG)).toEqual([])

    await page.close()
  })

  it('should not request the script when the counter is disabled', async () => {
    const requested: string[] = []
    const { page } = await openWithBlockedScript('/', requested)

    expect(requested).toEqual([])

    await page.close()
  })
})
