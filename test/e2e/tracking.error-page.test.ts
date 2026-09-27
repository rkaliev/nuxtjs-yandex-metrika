import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'
import { hitCalls, openWithStubbedScript } from './helpers'

describe('e2e tracking with a custom error page', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../fixtures/custom-error', import.meta.url)),
    browser: true,
    dev: false,
  })

  it('should send the error page hit without waiting for the head timeout', async () => {
    const { page } = await openWithStubbedScript('/')
    await expect.poll(async () => (await hitCalls(page)).length).toBe(1)

    // Measured inside the page: from the navigation to the hit reaching the ym queue
    const elapsed = await page.evaluate(async () => {
      const app = (document.querySelector('#__nuxt') as unknown as { __vue_app__: { config: { globalProperties: { $router: { push(path: string): Promise<unknown> } } } } }).__vue_app__
      const start = performance.now()
      await app.config.globalProperties.$router.push('/missing')
      await new Promise<void>((resolve) => {
        const check = () => (window.ym.a as unknown[][]).some(call => call[1] === 'hit' && call[2] === '/missing')
          ? resolve()
          : setTimeout(check, 10)
        check()
      })
      return performance.now() - start
    })

    expect((await page.textContent('h1.error'))?.trim()).toBe('404')
    // The head timeout is 1000 ms; the grace window after app:error is 300 ms
    expect(elapsed).toBeLessThan(600)
    const hits = await hitCalls(page)
    expect(hits[1]).toEqual(['99999999', 'hit', '/missing', { referer: '/', title: await page.title() }])

    await page.close()
  })
})
