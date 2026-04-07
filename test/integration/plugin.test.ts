import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockApi, createNoopApi } from '../../src/runtime/utils/mock'

describe('plugin modes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('disabled mode', () => {
    it('returns mock API when disabled', () => {
      const api = createMockApi(false)
      expect(api).toBeDefined()
      expect(typeof api.hit).toBe('function')
      expect(typeof api.reachGoal).toBe('function')
    })
  })

  describe('development mode', () => {
    it('returns mock API with debug logging', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const api = createMockApi(true)

      api.hit('/page')
      expect(spy).toHaveBeenCalledWith('[nuxt-yandex-metrika] hit:', '/page', undefined)
    })
  })

  describe('SSR noop mode', () => {
    it('returns noop API for server-side rendering', () => {
      const api = createNoopApi()
      expect(api).toBeDefined()
      // All methods should be no-ops
      expect(api.hit('/page')).toBeUndefined()
      expect(api.reachGoal('test')).toBeUndefined()
    })
  })
})

describe('auto-tracking simulation', () => {
  it('calls hit on navigation', () => {
    const api = createMockApi(false)
    const hitSpy = vi.spyOn(api, 'hit')

    // Simulate afterEach callback
    const to = { fullPath: '/about' }
    const from = { fullPath: '/' }

    api.hit(to.fullPath, { referer: from.fullPath })
    expect(hitSpy).toHaveBeenCalledWith('/about', { referer: '/' })
  })

  it('skips initial navigation', () => {
    const api = createMockApi(false)
    const hitSpy = vi.spyOn(api, 'hit')

    let isInitialNavigation = true
    const afterEach = (to: { fullPath: string }, from: { fullPath: string }) => {
      if (isInitialNavigation) {
        isInitialNavigation = false
        return
      }
      api.hit(to.fullPath, { referer: from.fullPath })
    }

    // First navigation — skipped
    afterEach({ fullPath: '/' }, { fullPath: '' })
    expect(hitSpy).not.toHaveBeenCalled()

    // Second navigation — tracked
    afterEach({ fullPath: '/about' }, { fullPath: '/' })
    expect(hitSpy).toHaveBeenCalledWith('/about', { referer: '/' })
  })
})
