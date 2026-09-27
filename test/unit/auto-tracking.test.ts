import { describe, it, expect, vi } from 'vitest'
import { setupAutoTracking } from '../../src/runtime/utils/auto-tracking'
import type { NavigationRouter, PageLifecycle } from '../../src/runtime/utils/auto-tracking'
import { createNoopApi } from '../../src/runtime/utils/mock'

type Guard = Parameters<NavigationRouter['afterEach']>[0]
type ReadyCallback = Parameters<PageLifecycle['onPageReady']>[0]

function setup(
  resolve: NavigationRouter['resolve'] = fullPath => ({ href: fullPath }),
  isHydrationPlaceholder: PageLifecycle['isHydrationPlaceholder'] = () => false,
  withTitle = true,
) {
  const guards: Guard[] = []
  const readyCallbacks: ReadyCallback[] = []
  const router: NavigationRouter = { afterEach: guard => guards.push(guard), resolve }
  const state = { title: 'Home' }
  const page: PageLifecycle = {
    onPageReady: callback => readyCallbacks.push(callback),
    ...(withTitle && { getTitle: async () => state.title }),
    isHydrationPlaceholder,
  }
  const api = createNoopApi()
  const hit = vi.spyOn(api, 'hit')
  setupAutoTracking(router, page, api)

  const navigate = (to: string, from: string, failure?: unknown) =>
    guards.forEach(guard => guard({ fullPath: to }, { fullPath: from }, failure))
  const ready = async () => {
    await Promise.all(readyCallbacks.map(callback => callback()))
  }
  const enter = async () => {
    navigate('/', '/')
    await ready()
  }
  return { hit, navigate, ready, enter, state, readyCallbacks }
}

describe('setupAutoTracking', () => {
  it('should send a hit with the title for the entry page', async () => {
    const { hit, enter } = setup()

    await enter()

    expect(hit).toHaveBeenCalledOnce()
    expect(hit).toHaveBeenCalledWith('/', { title: 'Home' })
  })

  it('should not send a hit before the page is ready', () => {
    const { hit, navigate } = setup()

    navigate('/', '/')

    expect(hit).not.toHaveBeenCalled()
  })

  it('should send a hit with referer and the title read when the page is ready', async () => {
    const { hit, navigate, ready, enter, state } = setup()

    await enter()
    navigate('/about', '/')
    state.title = 'About'
    await ready()

    expect(hit).toHaveBeenLastCalledWith('/about', { referer: '/', title: 'About' })
  })

  it('should not send a hit for a failed navigation', async () => {
    const { hit, navigate, ready, enter } = setup()

    await enter()
    navigate('/about', '/', new Error('aborted'))
    await ready()

    expect(hit).toHaveBeenCalledOnce()
  })

  it('should not send a hit when the url did not change', async () => {
    const { hit, navigate, ready, enter } = setup()

    await enter()
    navigate('/', '/')
    await ready()

    expect(hit).toHaveBeenCalledOnce()
  })

  it('should send a hit when only the query changes', async () => {
    const { hit, navigate, ready, enter } = setup()

    await enter()
    navigate('/?page=2', '/')
    await ready()

    expect(hit).toHaveBeenLastCalledWith('/?page=2', { referer: '/', title: 'Home' })
  })

  it('should include the router base in url and referer', async () => {
    const { hit, navigate, ready, enter } = setup(fullPath => ({ href: `/blog${fullPath}` }))

    await enter()
    navigate('/about', '/')
    await ready()

    expect(hit).toHaveBeenLastCalledWith('/blog/about', { referer: '/blog/', title: 'Home' })
  })

  it('should use the last sent page as referer when a navigation is superseded before the page is ready', async () => {
    const { hit, navigate, ready, enter } = setup()

    await enter()
    navigate('/a', '/')
    navigate('/b', '/a')
    await ready()

    expect(hit).toHaveBeenCalledTimes(2)
    expect(hit).toHaveBeenLastCalledWith('/b', { referer: '/', title: 'Home' })
  })

  it('should not track the route a prerendered page hydrates before its real url', async () => {
    const { hit, navigate, ready } = setup(undefined, fullPath => fullPath === '/')

    // Nuxt flushes the placeholder's page before replacing it with the real url
    navigate('/', '/')
    await ready()
    navigate('/?utm_source=test', '/')
    await ready()

    expect(hit).toHaveBeenCalledOnce()
    expect(hit).toHaveBeenCalledWith('/?utm_source=test', { title: 'Home' })
  })

  it('should not send a hit when returning to the last sent page before the next page is ready', async () => {
    const { hit, navigate, ready, enter } = setup()

    await enter()
    navigate('/a', '/')
    navigate('/', '/a')
    await ready()

    expect(hit).toHaveBeenCalledOnce()
  })

  it('should send hits without a title when the page gives no title', async () => {
    const { hit, navigate, ready, enter } = setup(undefined, undefined, false)

    await enter()
    navigate('/about', '/')
    await ready()

    // toStrictEqual: a `title: undefined` key would still reach Metrika
    expect(hit.mock.calls).toStrictEqual([['/', {}], ['/about', { referer: '/' }]])
  })

  it('should send the hit as soon as the page is ready when the page gives no title', () => {
    const { hit, navigate, readyCallbacks } = setup(undefined, undefined, false)

    navigate('/', '/')
    void readyCallbacks[0]!()

    expect(hit).toHaveBeenCalledWith('/', {})
  })
})
