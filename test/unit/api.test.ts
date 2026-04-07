import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRealApi, buildInitOptions } from '../../src/runtime/utils/api'

describe('createRealApi', () => {
  beforeEach(() => {
    window.ym = vi.fn() as unknown as typeof window.ym
  })

  it('delegates hit() to window.ym', () => {
    const api = createRealApi('123')
    api.hit('/page', { referer: '/' })
    expect(window.ym).toHaveBeenCalledWith('123', 'hit', '/page', { referer: '/' })
  })

  it('delegates reachGoal() to window.ym', () => {
    const api = createRealApi('123')
    const cb = vi.fn()
    api.reachGoal('buy', { price: 100 }, cb, null)
    expect(window.ym).toHaveBeenCalledWith('123', 'reachGoal', 'buy', { price: 100 }, cb, null)
  })

  it('delegates params() to window.ym', () => {
    const api = createRealApi('123')
    api.params({ key: 'value' })
    expect(window.ym).toHaveBeenCalledWith('123', 'params', { key: 'value' })
  })

  it('delegates userParams() to window.ym', () => {
    const api = createRealApi('123')
    api.userParams({ age: 25 })
    expect(window.ym).toHaveBeenCalledWith('123', 'userParams', { age: 25 })
  })

  it('delegates getClientID() to window.ym', () => {
    const api = createRealApi('123')
    const cb = vi.fn()
    api.getClientID(cb)
    expect(window.ym).toHaveBeenCalledWith('123', 'getClientID', cb)
  })

  it('delegates setUserID() to window.ym', () => {
    const api = createRealApi('123')
    api.setUserID('user456')
    expect(window.ym).toHaveBeenCalledWith('123', 'setUserID', 'user456')
  })

  it('delegates notBounce() to window.ym', () => {
    const api = createRealApi('123')
    api.notBounce({ callback: () => {} })
    expect(window.ym).toHaveBeenCalledWith('123', 'notBounce', expect.any(Object))
  })

  it('delegates addFileExtension() to window.ym', () => {
    const api = createRealApi('123')
    api.addFileExtension(['zip', 'rar'])
    expect(window.ym).toHaveBeenCalledWith('123', 'addFileExtension', ['zip', 'rar'])
  })

  it('delegates extLink() to window.ym', () => {
    const api = createRealApi('123')
    api.extLink('https://example.com', { title: 'Example' })
    expect(window.ym).toHaveBeenCalledWith('123', 'extLink', 'https://example.com', { title: 'Example' })
  })

  it('delegates file() to window.ym', () => {
    const api = createRealApi('123')
    api.file('/doc.pdf', { title: 'Doc' })
    expect(window.ym).toHaveBeenCalledWith('123', 'file', '/doc.pdf', { title: 'Doc' })
  })

  it('delegates replacePhones() to window.ym', () => {
    const api = createRealApi('123')
    api.replacePhones()
    expect(window.ym).toHaveBeenCalledWith('123', 'replacePhones')
  })

  it('does not throw if window.ym is not a function', () => {
    // @ts-expect-error — testing edge case
    delete window.ym
    const api = createRealApi('123')
    expect(() => api.hit('/page')).not.toThrow()
  })
})

describe('buildInitOptions', () => {
  it('extracts only init-related keys', () => {
    const result = buildInitOptions({
      id: '123',
      accurateTrackBounce: true,
      clickmap: true,
      defer: true,
      ecommerce: false,
      trackLinks: true,
      triggerEvent: true,
      ut: 'noindex',
      webvisor: false,
      useCDN: false,
      disabled: false,
      debug: true,
      noJS: true,
      autoTracking: true,
    })

    expect(result).toEqual({
      accurateTrackBounce: true,
      clickmap: true,
      defer: true,
      ecommerce: false,
      trackLinks: true,
      triggerEvent: true,
      ut: 'noindex',
      webvisor: false,
    })

    // Should NOT include non-init keys
    expect(result).not.toHaveProperty('id')
    expect(result).not.toHaveProperty('useCDN')
    expect(result).not.toHaveProperty('disabled')
    expect(result).not.toHaveProperty('debug')
    expect(result).not.toHaveProperty('noJS')
    expect(result).not.toHaveProperty('autoTracking')
  })

  it('omits undefined values', () => {
    const result = buildInitOptions({ clickmap: true })
    expect(result).toEqual({ clickmap: true })
    expect(Object.keys(result)).toHaveLength(1)
  })
})
