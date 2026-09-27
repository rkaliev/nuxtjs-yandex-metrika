import { describe, it, expect, vi } from 'vitest'
import { setupAutoTracking } from '../../src/runtime/utils/auto-tracking'
import type { NavigationRouter } from '../../src/runtime/utils/auto-tracking'
import { createNoopApi } from '../../src/runtime/utils/mock'

type Guard = Parameters<NavigationRouter['afterEach']>[0]

function setup() {
  const guards: Guard[] = []
  const router: NavigationRouter = { afterEach: guard => guards.push(guard) }
  const api = createNoopApi()
  const hit = vi.spyOn(api, 'hit')
  setupAutoTracking(router, api)
  const navigate = (to: string, from: string) => guards.forEach(guard => guard({ fullPath: to }, { fullPath: from }))
  return { hit, navigate }
}

describe('setupAutoTracking', () => {
  // Characterizes current behavior: the entry page is not tracked; part 3 changes this
  it('should not send a hit for the first navigation', () => {
    const { hit, navigate } = setup()

    navigate('/', '')

    expect(hit).not.toHaveBeenCalled()
  })

  it('should send a hit with referer for later navigations', () => {
    const { hit, navigate } = setup()

    navigate('/', '')
    navigate('/about', '/')

    expect(hit).toHaveBeenCalledOnce()
    expect(hit).toHaveBeenCalledWith('/about', { referer: '/' })
  })
})
