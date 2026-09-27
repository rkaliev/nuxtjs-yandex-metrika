// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadNuxt, useLogger } from '@nuxt/kit'

const __dir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dir, '../../playground')

const MISSING_ID_WARNING = 'Counter ID is not set'

/** Loads playground with `options` and returns the text of every warning the build logged */
async function buildWarnings(options: Record<string, unknown>): Promise<string[]> {
  const warnings: string[] = []
  // withTag loggers share the reporter list, so this reaches the module's logger
  const reporter = {
    log: (logObj: { type: string, args: unknown[] }) => {
      if (logObj.type === 'warn') warnings.push(logObj.args.join(' '))
    },
  }
  useLogger().addReporter(reporter)
  try {
    // Nuxt is silent in tests by default
    const nuxt = await loadNuxt({ cwd: rootDir, ready: true, overrides: { logLevel: 'info', yandexMetrika: options } })
    await nuxt.close()
  }
  finally {
    useLogger().removeReporter(reporter)
  }
  return warnings
}

describe('module registration', () => {
  it('populates runtimeConfig.public.yandexMetrika', async () => {
    const nuxt = await loadNuxt({
      cwd: rootDir,
      ready: true,
      overrides: {
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
    }
    finally {
      await nuxt.close()
    }
  })

  it('injects noscript pixel when noJS is enabled', async () => {
    const nuxt = await loadNuxt({
      cwd: rootDir,
      ready: true,
      overrides: {
        yandexMetrika: {
          id: '99999999',
          noJS: true,
        },
      },
    })

    try {
      const noscript = nuxt.options.app.head.noscript as Array<{ innerHTML: string }>
      const pixel = noscript.find(n => n.innerHTML?.includes('mc.yandex.ru/watch/99999999'))
      expect(pixel).toBeTruthy()
    }
    finally {
      await nuxt.close()
    }
  })

  it('does not inject noscript pixel when disabled', async () => {
    const nuxt = await loadNuxt({
      cwd: rootDir,
      ready: true,
      overrides: {
        yandexMetrika: {
          id: '99999999',
          disabled: true,
          noJS: true,
        },
      },
    })

    try {
      const noscript = nuxt.options.app.head.noscript as Array<{ innerHTML: string }> | undefined
      const pixel = noscript?.find(n => n.innerHTML?.includes('mc.yandex.ru/watch/99999999'))
      expect(pixel).toBeFalsy()
    }
    finally {
      await nuxt.close()
    }
  })

  it('does not inject noscript pixel without ID', async () => {
    const nuxt = await loadNuxt({
      cwd: rootDir,
      ready: true,
      overrides: {
        yandexMetrika: {
          id: '',
          noJS: true,
        },
      },
    })

    try {
      const noscript = nuxt.options.app.head.noscript as Array<{ innerHTML: string }> | undefined
      const pixel = noscript?.find(n => n.innerHTML?.includes('mc.yandex.ru/watch'))
      expect(pixel).toBeFalsy()
    }
    finally {
      await nuxt.close()
    }
  })

  it('should warn at build time when the id is missing', async () => {
    const warnings = await buildWarnings({ id: '' })
    expect(warnings.some(text => text.includes(MISSING_ID_WARNING))).toBe(true)
  })

  it('should not warn at build time when the id is set', async () => {
    const warnings = await buildWarnings({ id: '99999999' })
    expect(warnings.some(text => text.includes(MISSING_ID_WARNING))).toBe(false)
  })

  it('should not warn at build time when the counter is disabled', async () => {
    const warnings = await buildWarnings({ id: '', disabled: true })
    expect(warnings.some(text => text.includes(MISSING_ID_WARNING))).toBe(false)
  })
})
