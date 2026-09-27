import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defu } from 'defu'
import type { ModuleOptions, YandexMetrikaApi } from '../../src/runtime/types'
import { DEFAULT_OPTIONS, SCRIPT_URL, SCRIPT_URL_CDN } from '../../src/runtime/utils/constants'
import { isCounterEnabled, selectApi } from '../../src/runtime/utils/select-api'

function config(overrides: ModuleOptions = {}): Required<ModuleOptions> {
  return defu(overrides, { id: '99999999', debug: true }, DEFAULT_OPTIONS) as Required<ModuleOptions>
}

describe('selectApi', () => {
  let fakeScript: { async: boolean, src: string, onload: (() => void) | null, onerror: (() => void) | null }
  let warn: ReturnType<typeof vi.spyOn>
  let log: ReturnType<typeof vi.spyOn>
  let error: ReturnType<typeof vi.spyOn>
  const originalCreateElement = document.createElement.bind(document)

  function expectMockApi(api: YandexMetrikaApi) {
    api.hit('/x')
    expect(log).toHaveBeenCalledWith('[nuxt-yandex-metrika] hit:', '/x', undefined)
    expect(window.ym).not.toHaveBeenCalled()
  }

  beforeEach(() => {
    window.ym = vi.fn() as unknown as typeof window.ym
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    log = vi.spyOn(console, 'log').mockImplementation(() => {})
    error = vi.spyOn(console, 'error').mockImplementation(() => {})

    // A fake <script> keeps happy-dom from fetching the URL
    fakeScript = { async: false, src: '', onload: null, onerror: null }
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'script') return fakeScript as unknown as HTMLScriptElement
      return originalCreateElement(tag)
    })
    vi.spyOn(document, 'getElementsByTagName').mockReturnValue([] as unknown as HTMLCollectionOf<Element>)
    vi.spyOn(document.head, 'appendChild').mockImplementation(node => node)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return the mock api when disabled', async () => {
    expectMockApi(await selectApi(config({ disabled: true }), false))
  })

  it('should not warn when disabled with an id', async () => {
    await selectApi(config({ disabled: true }), false)
    expect(warn).not.toHaveBeenCalled()
  })

  it('should warn about a missing id in dev', async () => {
    await selectApi(config({ id: '' }), true)
    expect(warn).toHaveBeenCalledWith('[nuxt-yandex-metrika] Counter ID is not set. Using mock API.')
  })

  it('should not warn about a missing id in production', async () => {
    await selectApi(config({ id: '' }), false)
    expect(warn).not.toHaveBeenCalledWith('[nuxt-yandex-metrika] Counter ID is not set. Using mock API.')
  })

  it('should return the mock api in dev without loading the script', async () => {
    const api = await selectApi(config(), true)
    expect(document.createElement).not.toHaveBeenCalledWith('script')
    expectMockApi(api)
  })

  it('should warn about dev mode', async () => {
    await selectApi(config(), true)
    expect(warn).toHaveBeenCalledWith('[nuxt-yandex-metrika] Development mode: using mock API.')
  })

  it('should warn about debug in dev mode when debug is set', async () => {
    await selectApi(config(), true)
    expect(warn).toHaveBeenCalledWith('[nuxt-yandex-metrika] Debug is enabled: you\'ll see all API calls in the console.')
  })

  it('should load the default script in production', async () => {
    const promise = selectApi(config(), false)
    fakeScript.onload!()
    await promise
    expect(fakeScript.src).toBe(SCRIPT_URL)
  })

  it('should load the CDN script when useCDN is set', async () => {
    const promise = selectApi(config({ useCDN: true }), false)
    fakeScript.onload!()
    await promise
    expect(fakeScript.src).toBe(SCRIPT_URL_CDN)
  })

  it('should init the counter after the script loads', async () => {
    const promise = selectApi(config(), false)
    fakeScript.onload!()
    await promise
    expect(window.ym).toHaveBeenCalledWith('99999999', 'init', {
      accurateTrackBounce: true,
      clickmap: true,
      defer: true,
      ecommerce: false,
      trackLinks: true,
      triggerEvent: true,
      ut: 'noindex',
      webvisor: false,
    })
  })

  it('should return the real api after the script loads', async () => {
    const promise = selectApi(config(), false)
    fakeScript.onload!()
    const api = await promise

    api.hit('/x')

    expect(window.ym).toHaveBeenCalledWith('99999999', 'hit', '/x', undefined)
  })

  it('should log an error when the script fails to load', async () => {
    const promise = selectApi(config(), false)
    fakeScript.onerror!()
    await promise
    expect(error).toHaveBeenCalledWith(
      '[nuxt-yandex-metrika] Failed to load Yandex Metrika script. Falling back to mock API.',
      expect.any(Error),
    )
  })

  it('should return the mock api when the script fails to load', async () => {
    const promise = selectApi(config(), false)
    fakeScript.onerror!()
    expectMockApi(await promise)
  })
})

describe('isCounterEnabled', () => {
  it('should be false when disabled', () => {
    expect(isCounterEnabled({ id: '99999999', disabled: true })).toBe(false)
  })

  it('should be false without an id', () => {
    expect(isCounterEnabled({ id: '' })).toBe(false)
  })

  it('should be true with an id when not disabled', () => {
    expect(isCounterEnabled({ id: '99999999', disabled: false })).toBe(true)
  })
})
