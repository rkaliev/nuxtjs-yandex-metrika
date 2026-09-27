import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadScript } from '../../src/runtime/utils/script-loader'

describe('loadScript', () => {
  let originalYm: typeof window.ym
  let fakeScript: Record<string, unknown>
  let existingScript: HTMLScriptElement
  let insertBeforeSpy: ReturnType<typeof vi.spyOn>
  const originalCreateElement = document.createElement.bind(document)

  beforeEach(() => {
    originalYm = window.ym
    // @ts-expect-error -- ym is a required global; removed to test a clean window
    delete window.ym

    // Mock createElement to return a plain object for script elements
    // This prevents happy-dom from trying to actually fetch the URL
    fakeScript = {
      async: false,
      src: '',
      onload: null as ((ev: Event) => void) | null,
      onerror: null as ((ev: Event) => void) | null,
    }

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'script') return fakeScript as unknown as HTMLScriptElement
      return originalCreateElement(tag)
    })

    // Ensure there's a script element with parentNode for insertBefore
    const parent = document.createElement('div')
    existingScript = originalCreateElement('script') as HTMLScriptElement
    parent.appendChild(existingScript)
    vi.spyOn(document, 'getElementsByTagName').mockReturnValue(
      [existingScript] as unknown as HTMLCollectionOf<Element>,
    )
    insertBeforeSpy = vi.spyOn(existingScript.parentNode!, 'insertBefore').mockReturnValue(fakeScript as unknown as Node)
  })

  afterEach(() => {
    window.ym = originalYm
    vi.restoreAllMocks()
  })

  it('creates ym stub function', async () => {
    const promise = loadScript('https://mc.yandex.ru/metrika/tag.js')

    expect(typeof window.ym).toBe('function')
    expect(window.ym.l).toBeTypeOf('number')
    expect(fakeScript.async).toBe(true)
    expect(fakeScript.src).toBe('https://mc.yandex.ru/metrika/tag.js')

    // Simulate script load
    ;(fakeScript.onload as (ev: Event) => void)(new Event('load'))
    await promise
  })

  it('queues calls via ym stub', async () => {
    const promise = loadScript('https://mc.yandex.ru/metrika/tag.js')

    window.ym('123', 'init', { clickmap: true })
    expect(window.ym.a).toHaveLength(1)
    expect(window.ym.a![0]).toEqual(['123', 'init', { clickmap: true }])

    // Resolve to avoid unhandled rejection
    ;(fakeScript.onload as (ev: Event) => void)(new Event('load'))
    await promise
  })

  it('creates a script element with correct src', async () => {
    const promise = loadScript('https://mc.yandex.ru/metrika/tag.js')

    expect(fakeScript.src).toBe('https://mc.yandex.ru/metrika/tag.js')
    expect(document.createElement).toHaveBeenCalledWith('script')

    ;(fakeScript.onload as (ev: Event) => void)(new Event('load'))
    await promise
  })

  it('rejects on script error', async () => {
    const promise = loadScript('https://mc.yandex.ru/metrika/tag.js')

    ;(fakeScript.onerror as (ev: Event) => void)(new Event('error'))

    await expect(promise).rejects.toThrow('Failed to load script')
  })

  it('does not overwrite existing ym function', async () => {
    const existingYm = vi.fn() as unknown as typeof window.ym
    window.ym = existingYm

    const promise = loadScript('https://mc.yandex.ru/metrika/tag.js')

    expect(window.ym).toBe(existingYm)

    ;(fakeScript.onload as (ev: Event) => void)(new Event('load'))
    await promise
  })

  it('should insert the script before the first script', async () => {
    const promise = loadScript('https://mc.yandex.ru/metrika/tag.js')

    expect(insertBeforeSpy).toHaveBeenCalledWith(fakeScript, existingScript)

    ;(fakeScript.onload as (ev: Event) => void)(new Event('load'))
    await promise
  })

  it('should append the script to head when the page has no scripts', async () => {
    vi.mocked(document.getElementsByTagName).mockReturnValue([] as unknown as HTMLCollectionOf<Element>)
    const appendSpy = vi.spyOn(document.head, 'appendChild').mockImplementation(node => node)

    const promise = loadScript('https://mc.yandex.ru/metrika/tag.js')

    expect(appendSpy).toHaveBeenCalledWith(fakeScript)

    ;(fakeScript.onload as (ev: Event) => void)(new Event('load'))
    await promise
  })
})
