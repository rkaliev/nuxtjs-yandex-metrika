import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { HIT_LOG, navigateToAbout, openPage } from './helpers'

describe('e2e tracking', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground', import.meta.url)),
    browser: true,
    // Dev mode: the plugin uses the mock API, whose debug logs the browser tests assert on.
    // test-utils runs `nuxi _dev` in playground, which ignores `nuxtConfig` overrides:
    // this suite relies on playground/nuxt.config.ts (id set, debug: true).
    dev: true,
  })

  it('renders home page via SSR without errors', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Home')
  })

  it('should render a page that calls the composable during SSR', async () => {
    const html = await $fetch('/about')
    expect(html).toContain('About')
  })

  it('should render the noscript pixel', async () => {
    const html = await $fetch('/')
    expect(html).toContain('<noscript><div><img src="https://mc.yandex.ru/watch/12345678"')
  })

  it('should log a hit with the title for the entry page', async () => {
    const { page, logsWith } = await openPage('/')

    await expect.poll(() => logsWith(HIT_LOG)).toEqual([[HIT_LOG, '/', { title: 'Home' }]])

    await page.close()
  })

  it('should log a hit with referer on client-side navigation', async () => {
    const { page, logsWith } = await openPage('/')

    await navigateToAbout(page)

    await expect.poll(() => logsWith(HIT_LOG)).toEqual([
      [HIT_LOG, '/', { title: 'Home' }],
      [HIT_LOG, '/about', { referer: '/', title: 'About' }],
    ])

    await page.close()
  })

  it('should not log a hit when navigating to the current page', async () => {
    const { page, logsWith, settled } = await openPage('/')
    await expect.poll(() => logsWith(HIT_LOG)).toHaveLength(1)

    await page.click('a.nav-link[href="/"]')
    // A negative check has no event to wait for: give the router guards time to run
    await page.waitForTimeout(500)

    await settled()
    expect(logsWith(HIT_LOG)).toEqual([[HIT_LOG, '/', { title: 'Home' }]])

    await page.close()
  })

  it('should log a hit when only the query changes', async () => {
    const { page, logsWith } = await openPage('/about')
    await expect.poll(() => logsWith(HIT_LOG)).toHaveLength(1)

    await page.click('a[href="/about?tab=info"]')

    await expect.poll(() => logsWith(HIT_LOG)).toEqual([
      [HIT_LOG, '/about', { title: 'About' }],
      [HIT_LOG, '/about?tab=info', { referer: '/about', title: 'About' }],
    ])

    await page.close()
  })

  it('should log reachGoal from the composable', async () => {
    const { page, logsWith } = await openPage('/')

    await page.click('button.btn')

    await expect.poll(() => logsWith('[nuxt-yandex-metrika] reachGoal:').map(args => args.slice(0, 3)))
      .toEqual([['[nuxt-yandex-metrika] reachGoal:', 'test_goal', { page: 'home' }]])

    await page.close()
  })
})
