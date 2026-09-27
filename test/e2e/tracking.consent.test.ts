import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'
import { SCRIPT_GLOB, grantConsent, hitCalls, navigateToAbout, openPage, openWithStubbedScript, ymCalls } from './helpers'

describe('e2e tracking with requireConsent', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground', import.meta.url)),
    browser: true,
    dev: false,
    nuxtConfig: {
      yandexMetrika: {
        id: '99999999',
        requireConsent: true,
      },
    },
  })

  it('should not request tag.js or call ym before consent', async () => {
    const requested: string[] = []
    const { page } = await openPage('/', page => page.route(SCRIPT_GLOB, (route) => {
      requested.push(route.request().url())
      return route.fulfill({ contentType: 'text/javascript', body: '' })
    }))

    await navigateToAbout(page)

    expect(requested).toEqual([])
    expect(await page.evaluate(() => typeof window.ym)).toBe('undefined')

    await page.close()
  })

  it('should start the counter and send the current page hit on consent', async () => {
    const requested: string[] = []
    const { page } = await openWithStubbedScript('/', requested)

    await grantConsent(page)

    await expect.poll(() => hitCalls(page)).toStrictEqual([['99999999', 'hit', '/', { title: 'Home' }]])
    expect(requested).toEqual(['https://mc.yandex.ru/metrika/tag.js'])
    expect((await ymCalls(page))[0]?.[1]).toBe('init')

    await navigateToAbout(page)

    await expect.poll(() => hitCalls(page)).toStrictEqual([
      ['99999999', 'hit', '/', { title: 'Home' }],
      ['99999999', 'hit', '/about', { referer: '/', title: 'About' }],
    ])

    await page.close()
  })
})
