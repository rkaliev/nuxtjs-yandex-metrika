import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'
import { HIT_LOG, navigateToAbout, openPage } from './helpers'

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
    const { page, logsWith } = await openPage('/')

    await navigateToAbout(page)
    // A negative check has no event to wait for: give the router guards time to run
    await page.waitForTimeout(500)

    expect(logsWith(HIT_LOG)).toEqual([])

    await page.close()
  })
})
