import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch, createPage } from '@nuxt/test-utils/e2e'

describe('e2e tracking', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground', import.meta.url)),
    browser: true,
    nuxtConfig: {
      // @ts-expect-error -- module option, typed via Nuxt augmentation
      yandexMetrika: {
        id: '99999999',
        debug: true,
      },
    },
  })

  it('renders home page via SSR without errors', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Home')
  })

  it('renders about page via SSR without errors', async () => {
    const html = await $fetch('/about')
    expect(html).toContain('About')
  })

  it('tracks navigation and reachGoal in browser', async () => {
    const page = await createPage('/')
    const logs: string[] = []

    page.on('console', (msg: { text(): string }) => {
      logs.push(msg.text())
    })

    // Click on About link
    await page.click('a[href="/about"]')
    await page.waitForURL('**/about')

    // Navigate back
    await page.click('a[href="/"]')
    await page.waitForURL('**/')

    // Click reachGoal button
    await page.click('button')

    // Wait for logs to flush
    await page.waitForTimeout(500)

    // Dev mode uses mock — check that debug logs were emitted
    const hitLogs = logs.filter(l => l.includes('[nuxt-yandex-metrika] hit:'))
    const goalLogs = logs.filter(l => l.includes('[nuxt-yandex-metrika] reachGoal:'))

    expect(hitLogs.length).toBeGreaterThanOrEqual(1)
    expect(goalLogs.length).toBeGreaterThanOrEqual(1)

    await page.close()
  })
})
