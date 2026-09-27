import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'
import { hitCalls, openWithStubbedScript } from './helpers'

describe('e2e tracking of a prerendered page', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground', import.meta.url)),
    browser: true,
    dev: false,
    nuxtConfig: {
      nitro: { prerender: { routes: ['/'] } },
      yandexMetrika: {
        id: '99999999',
        debug: true,
      },
    },
  })

  // Nuxt first hydrates the payload route (`/`), then replaces it with the real URL
  it('should send one entry hit with the query when a prerendered page is opened with a query', async () => {
    const { page } = await openWithStubbedScript('/?utm_source=test')

    await expect.poll(() => hitCalls(page)).not.toHaveLength(0)
    // A second hit would arrive right after the first: give it time to show up
    await page.waitForTimeout(500)

    expect(await hitCalls(page)).toEqual([['99999999', 'hit', '/?utm_source=test', { title: 'Home' }]])

    await page.close()
  })
})
