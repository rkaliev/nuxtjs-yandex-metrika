import { describe, it, expect, vi } from 'vitest'
import { createApi } from '../../src/runtime/utils/methods'

describe('createApi', () => {
  it('should build an api with every YandexMetrikaApi method', () => {
    const api = createApi(() => {})

    expect(Object.keys(api).sort()).toEqual([
      'addFileExtension',
      'extLink',
      'file',
      'getClientID',
      'grantConsent',
      'hit',
      'notBounce',
      'params',
      'reachGoal',
      'replacePhones',
      'setUserID',
      'userParams',
    ])
  })

  it('should pad missing arguments with undefined up to the method arity', () => {
    const handler = vi.fn()
    const api = createApi(handler)

    api.hit('/a')

    expect(handler).toHaveBeenCalledWith('hit', ['/a', undefined])
  })

  it('should drop arguments beyond the method arity', () => {
    const handler = vi.fn()
    const api = createApi(handler)

    ;(api.replacePhones as (...args: unknown[]) => void)('extra')

    expect(handler).toHaveBeenCalledWith('replacePhones', [])
  })

  it('should not pass grantConsent to the handler', () => {
    const handler = vi.fn()

    createApi(handler).grantConsent()

    expect(handler).not.toHaveBeenCalled()
  })

  it('should call the given grantConsent', () => {
    const grantConsent = vi.fn()

    createApi(() => {}, grantConsent).grantConsent()

    expect(grantConsent).toHaveBeenCalledOnce()
  })
})
