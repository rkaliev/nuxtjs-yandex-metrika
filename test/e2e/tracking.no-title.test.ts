import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'
import { hitCalls, navigateToAbout, openWithStubbedScript, ymCalls } from './helpers'

describe('e2e tracking with sendTitle false', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground', import.meta.url)),
    browser: true,
    dev: false,
    nuxtConfig: {
      yandexMetrika: {
        id: '99999999',
        sendTitle: false,
      },
    },
  })

  it('should init the counter with sendTitle false', async () => {
    const { page } = await openWithStubbedScript('/')

    expect((await ymCalls(page))[0]).toEqual(['99999999', 'init', expect.objectContaining({ sendTitle: false })])

    await page.close()
  })

  it('should send the entry and navigation hits without a title', async () => {
    const { page } = await openWithStubbedScript('/')

    await navigateToAbout(page)

    // toStrictEqual: a `title: undefined` key would still reach Metrika
    await expect.poll(() => hitCalls(page)).toStrictEqual([
      ['99999999', 'hit', '/', {}],
      ['99999999', 'hit', '/about', { referer: '/' }],
    ])

    await page.close()
  })
})
