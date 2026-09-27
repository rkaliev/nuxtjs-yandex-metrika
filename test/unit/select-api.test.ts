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
    expect(window.ym).not.toHaveBeenCalledWith(expect.anything(), 'hit', expect.anything(), expect.anything())
  }

  async function failScriptLoad() {
    fakeScript.onerror!()
    await vi.waitFor(() => expect(error).toHaveBeenCalled())
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

  it('should return the mock api when disabled', () => {
    expectMockApi(selectApi(config({ disabled: true }), false))
  })

  it('should not warn when disabled with an id', () => {
    selectApi(config({ disabled: true }), false)
    expect(warn).not.toHaveBeenCalled()
  })

  it('should warn about a missing id in dev', () => {
    selectApi(config({ id: '' }), true)
    expect(warn).toHaveBeenCalledWith('[nuxt-yandex-metrika] Counter ID is not set. Using mock API.')
  })

  it('should not warn about a missing id in production', () => {
    selectApi(config({ id: '' }), false)
    expect(warn).not.toHaveBeenCalledWith('[nuxt-yandex-metrika] Counter ID is not set. Using mock API.')
  })

  it('should return the mock api in dev without loading the script', () => {
    const api = selectApi(config(), true)
    expect(document.createElement).not.toHaveBeenCalledWith('script')
    expectMockApi(api)
  })

  it('should warn about dev mode', () => {
    selectApi(config(), true)
    expect(warn).toHaveBeenCalledWith('[nuxt-yandex-metrika] Development mode: using mock API.')
  })

  it('should warn about debug in dev mode when debug is set', () => {
    selectApi(config(), true)
    expect(warn).toHaveBeenCalledWith('[nuxt-yandex-metrika] Debug is enabled: you\'ll see all API calls in the console.')
  })

  it('should load the default script in production', () => {
    selectApi(config(), false)
    expect(fakeScript.src).toBe(SCRIPT_URL)
  })

  it('should load the CDN script when useCDN is set', () => {
    selectApi(config({ useCDN: true }), false)
    expect(fakeScript.src).toBe(SCRIPT_URL_CDN)
  })

  it('should init the counter before the script loads', () => {
    selectApi(config(), false)
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

  it('should pass a numeric id to ym as a string', () => {
    // A runtime NUXT_PUBLIC_YANDEX_METRIKA_ID=99999999 reaches the config as a number
    const api = selectApi(config({ id: 99999999 as unknown as string }), false)

    api.hit('/x')

    expect(window.ym).toHaveBeenCalledWith('99999999', 'init', expect.anything())
    expect(window.ym).toHaveBeenCalledWith('99999999', 'hit', '/x', undefined)
  })

  it('should return the real api before the script loads', () => {
    const api = selectApi(config(), false)

    api.hit('/x')

    expect(window.ym).toHaveBeenCalledWith('99999999', 'hit', '/x', undefined)
  })

  it('should log an error when the script fails to load', async () => {
    selectApi(config(), false)
    fakeScript.onerror!()
    await vi.waitFor(() => expect(error).toHaveBeenCalledWith(
      '[nuxt-yandex-metrika] Failed to load Yandex Metrika script. Falling back to mock API.',
      expect.any(Error),
    ))
  })

  it('should switch to the mock api when the script fails to load', async () => {
    const api = selectApi(config(), false)
    await failScriptLoad()
    expectMockApi(api)
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
