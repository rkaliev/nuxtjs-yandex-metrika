// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'

const __dir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dir, '../../playground')

describe('module registration', () => {
  it('populates runtimeConfig.public.yandexMetrika', async () => {
    const nuxt = await loadNuxt({
      cwd: rootDir,
      ready: true,
      overrides: {
        // @ts-expect-error -- module option, typed via Nuxt augmentation
        yandexMetrika: {
          id: '99999999',
          debug: true,
          noJS: true,
        },
      },
    })

    try {
      const config = nuxt.options.runtimeConfig.public.yandexMetrika as Record<string, unknown>
      expect(config.id).toBe('99999999')
      expect(config.debug).toBe(true)
      expect(config.noJS).toBe(true)
      expect(config.defer).toBe(true) // default
      expect(config.autoTracking).toBe(true) // default
    } finally {
      await nuxt.close()
    }
  })

  it('injects noscript pixel when noJS is enabled', async () => {
    const nuxt = await loadNuxt({
      cwd: rootDir,
      ready: true,
      overrides: {
        // @ts-expect-error -- module option, typed via Nuxt augmentation
        yandexMetrika: {
          id: '99999999',
          noJS: true,
        },
      },
    })

    try {
      const noscript = nuxt.options.app.head.noscript as Array<{ children: string }>
      const pixel = noscript.find(n => n.children?.includes('mc.yandex.ru/watch/99999999'))
      expect(pixel).toBeTruthy()
    } finally {
      await nuxt.close()
    }
  })

  it('does not inject noscript pixel when disabled', async () => {
    const nuxt = await loadNuxt({
      cwd: rootDir,
      ready: true,
      overrides: {
        // @ts-expect-error -- module option, typed via Nuxt augmentation
        yandexMetrika: {
          id: '99999999',
          disabled: true,
          noJS: true,
        },
      },
    })

    try {
      const noscript = nuxt.options.app.head.noscript as Array<{ children: string }> | undefined
      const pixel = noscript?.find(n => n.children?.includes('mc.yandex.ru/watch/99999999'))
      expect(pixel).toBeFalsy()
    } finally {
      await nuxt.close()
    }
  })

  it('does not inject noscript pixel without ID', async () => {
    const nuxt = await loadNuxt({
      cwd: rootDir,
      ready: true,
      overrides: {
        // @ts-expect-error -- module option, typed via Nuxt augmentation
        yandexMetrika: {
          id: '',
          noJS: true,
        },
      },
    })

    try {
      const noscript = nuxt.options.app.head.noscript as Array<{ children: string }> | undefined
      const pixel = noscript?.find(n => n.children?.includes('mc.yandex.ru/watch'))
      expect(pixel).toBeFalsy()
    } finally {
      await nuxt.close()
    }
  })
})
