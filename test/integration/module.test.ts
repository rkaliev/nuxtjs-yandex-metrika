// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadNuxt, useLogger } from '@nuxt/kit'

const __dir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dir, '../../playground')

const MISSING_ID_WARNING = 'Counter ID is not set'
const TRACK_HASH_WARNING = 'counted twice'

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

  it('should store the Metrika defaults for the new init options', async () => {
    const nuxt = await loadNuxt({ cwd: rootDir, ready: true, overrides: { yandexMetrika: { id: '99999999' } } })

    try {
      expect(nuxt.options.runtimeConfig.public.yandexMetrika).toMatchObject({
        trackHash: false,
        sendTitle: true,
        childIframe: false,
        disableYtm: false,
        type: 0,
        params: {},
        userParams: {},
        trustedDomains: [],
      })
    }
    finally {
      await nuxt.close()
    }
  })

  it('should keep trustedDomains as configured', async () => {
    const nuxt = await loadNuxt({ cwd: rootDir, ready: true, overrides: { yandexMetrika: { id: '99999999', trustedDomains: ['a.com'] } } })

    try {
      const config = nuxt.options.runtimeConfig.public.yandexMetrika as Record<string, unknown>
      expect(config.trustedDomains).toEqual(['a.com'])
    }
    finally {
      await nuxt.close()
    }
  })

  it('should store a numeric id in runtimeConfig as a string', async () => {
    // A JS nuxt.config can set it as a number
    const nuxt = await loadNuxt({ cwd: rootDir, ready: true, overrides: { yandexMetrika: { id: 99999999 as unknown as string } } })

    try {
      const config = nuxt.options.runtimeConfig.public.yandexMetrika as Record<string, unknown>
      expect(config.id).toBe('99999999')
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

  it('should not inject the noscript pixel when requireConsent is set', async () => {
    const nuxt = await loadNuxt({ cwd: rootDir, ready: true, overrides: { yandexMetrika: { id: '99999999', noJS: true, requireConsent: true } } })

    try {
      const noscript = nuxt.options.app.head.noscript as Array<{ innerHTML: string }> | undefined
      expect(noscript?.find(n => n.innerHTML?.includes('mc.yandex.ru/watch'))).toBeFalsy()
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

  it('should warn at build time when trackHash is used with autoTracking', async () => {
    const warnings = await buildWarnings({ id: '99999999', trackHash: true })
    expect(warnings.some(text => text.includes(TRACK_HASH_WARNING))).toBe(true)
  })

  it('should not warn about trackHash without autoTracking', async () => {
    const warnings = await buildWarnings({ id: '99999999', trackHash: true, autoTracking: false })
    expect(warnings.some(text => text.includes(TRACK_HASH_WARNING))).toBe(false)
  })

  it('should not warn about trackHash when the counter is disabled', async () => {
    const warnings = await buildWarnings({ id: '99999999', trackHash: true, disabled: true })
    expect(warnings.some(text => text.includes(TRACK_HASH_WARNING))).toBe(false)
  })

  it('should register the yandex-metrika type template', async () => {
    const nuxt = await loadNuxt({ cwd: rootDir, ready: true })

    try {
      const template = nuxt.options.build.templates.find(t => t.filename === 'types/yandex-metrika.d.ts')
      const contents = await template?.getContents?.({ nuxt, app: nuxt.apps.default!, options: {} })
      expect(contents).toContain('declare module \'#app\'')
      expect(contents).toContain('declare module \'vue\'')
      expect(contents).toContain('declare module \'nuxt/schema\'')
      expect(contents).toContain('$yandexMetrika: YandexMetrikaApi')
      expect(contents).toContain('yandexMetrika: Required<ModuleOptions>')
      expect(contents).not.toContain('interface Window')
    }
    finally {
      await nuxt.close()
    }
  })

  it('should register the type template when the counter is disabled', async () => {
    const nuxt = await loadNuxt({ cwd: rootDir, ready: true, overrides: { yandexMetrika: { disabled: true } } })

    try {
      const filenames = nuxt.options.build.templates.map(t => t.filename)
      expect(filenames).toContain('types/yandex-metrika.d.ts')
    }
    finally {
      await nuxt.close()
    }
  })
})
