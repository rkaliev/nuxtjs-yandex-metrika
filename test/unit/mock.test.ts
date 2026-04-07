import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockApi, createNoopApi } from '../../src/runtime/utils/mock'

describe('createMockApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('logs calls when debug is true', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const api = createMockApi(true)

    api.hit('/test', { referer: '/' })
    expect(spy).toHaveBeenCalledWith('[nuxt-yandex-metrika] hit:', '/test', { referer: '/' })

    api.reachGoal('click', { button: 'buy' })
    expect(spy).toHaveBeenCalledWith(
      '[nuxt-yandex-metrika] reachGoal:',
      'click',
      { button: 'buy' },
      undefined,
      undefined,
    )

    api.params({ key: 'value' })
    expect(spy).toHaveBeenCalledWith('[nuxt-yandex-metrika] params:', { key: 'value' })

    api.userParams({ age: 25 })
    expect(spy).toHaveBeenCalledWith('[nuxt-yandex-metrika] userParams:', { age: 25 })

    api.setUserID('user123')
    expect(spy).toHaveBeenCalledWith('[nuxt-yandex-metrika] setUserID:', 'user123')

    api.notBounce()
    expect(spy).toHaveBeenCalledWith('[nuxt-yandex-metrika] notBounce:', undefined)

    api.addFileExtension('zip')
    expect(spy).toHaveBeenCalledWith('[nuxt-yandex-metrika] addFileExtension:', 'zip')

    api.extLink('https://example.com')
    expect(spy).toHaveBeenCalledWith('[nuxt-yandex-metrika] extLink:', 'https://example.com', undefined)

    api.file('/doc.pdf')
    expect(spy).toHaveBeenCalledWith('[nuxt-yandex-metrika] file:', '/doc.pdf', undefined)

    api.replacePhones()
    expect(spy).toHaveBeenCalledWith('[nuxt-yandex-metrika] replacePhones:')

    const cb = vi.fn()
    api.getClientID(cb)
    expect(spy).toHaveBeenCalledWith('[nuxt-yandex-metrika] getClientID:', cb)
  })

  it('does not log when debug is false', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const api = createMockApi(false)

    api.hit('/test')
    api.reachGoal('click')
    api.params({})
    api.userParams({})
    api.setUserID('user')
    api.notBounce()
    api.addFileExtension('zip')
    api.extLink('https://example.com')
    api.file('/doc.pdf')
    api.replacePhones()
    api.getClientID(vi.fn())

    expect(spy).not.toHaveBeenCalled()
  })
})

describe('createNoopApi', () => {
  it('returns an API where all methods are no-ops', () => {
    const api = createNoopApi()

    // Should not throw
    expect(() => {
      api.hit('/test')
      api.reachGoal('click')
      api.params({})
      api.userParams({})
      api.setUserID('user')
      api.notBounce()
      api.addFileExtension('zip')
      api.extLink('https://example.com')
      api.file('/doc.pdf')
      api.replacePhones()
      api.getClientID(vi.fn())
    }).not.toThrow()
  })

  it('returns undefined from all methods', () => {
    const api = createNoopApi()
    expect(api.hit('/test')).toBeUndefined()
    expect(api.reachGoal('click')).toBeUndefined()
    expect(api.replacePhones()).toBeUndefined()
  })
})
