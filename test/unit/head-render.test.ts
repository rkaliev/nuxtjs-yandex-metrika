import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createHeadRender } from '../../src/runtime/utils/head-render'

type HookName = 'dom:rendered' | 'entries:updated'

/** An unhead client stand-in: `dirty` and the two hooks the plugin listens to */
function fakeHead(dirty: boolean) {
  const handlers = new Map<HookName, Set<() => void>>([['dom:rendered', new Set()], ['entries:updated', new Set()]])
  return {
    dirty,
    hooks: {
      hook(name: HookName, fn: () => void) {
        handlers.get(name)!.add(fn)
        return () => {
          handlers.get(name)!.delete(fn)
        }
      },
    },
    call(name: HookName) {
      for (const fn of [...handlers.get(name)!]) fn()
    },
    listenerCount: () => handlers.get('dom:rendered')!.size + handlers.get('entries:updated')!.size,
  }
}

function track(promise: Promise<void>) {
  const state = { resolved: false }
  void promise.then(() => {
    state.resolved = true
  })
  return state
}

describe('createHeadRender', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should resolve headRendered right away when no head render is pending', async () => {
    const state = track(createHeadRender(fakeHead(false)).headRendered())

    await Promise.resolve()

    expect(state.resolved).toBe(true)
  })

  it('should resolve headRendered a macrotask after the pending head render', async () => {
    const head = fakeHead(true)
    const state = track(createHeadRender(head).headRendered())
    await vi.advanceTimersByTimeAsync(500)
    expect(state.resolved).toBe(false)

    head.call('dom:rendered')
    await Promise.resolve()
    expect(state.resolved).toBe(false)

    await vi.advanceTimersByTimeAsync(0)
    expect(state.resolved).toBe(true)
  })

  it('should resolve headRendered a macrotask after 1000 ms when the pending render never happens', async () => {
    const state = track(createHeadRender(fakeHead(true)).headRendered())

    await vi.advanceTimersByTimeAsync(1000)
    expect(state.resolved).toBe(false)

    // The next macrotask: a zero delay set inside a fake timer is scheduled 1 ms later
    await vi.advanceTimersToNextTimerAsync()
    expect(state.resolved).toBe(true)
  })

  it('should ignore a render before the head update when waiting after an update', async () => {
    const head = fakeHead(true)
    const state = track(createHeadRender(head).nextHeadRender(true))

    head.call('dom:rendered')
    await vi.advanceTimersByTimeAsync(0)
    expect(state.resolved).toBe(false)

    head.call('entries:updated')
    head.call('dom:rendered')
    await vi.advanceTimersByTimeAsync(0)
    expect(state.resolved).toBe(true)
  })

  it('should resolve a macrotask after 300 ms without a head update when no render is pending', async () => {
    const state = track(createHeadRender(fakeHead(false)).nextHeadRender(true))

    await vi.advanceTimersByTimeAsync(300)
    expect(state.resolved).toBe(false)

    // The next macrotask: a zero delay set inside a fake timer is scheduled 1 ms later
    await vi.advanceTimersToNextTimerAsync()
    expect(state.resolved).toBe(true)
  })

  it('should wait for the pending render when 300 ms pass without a head update', async () => {
    const head = fakeHead(true)
    const state = track(createHeadRender(head).nextHeadRender(true))

    await vi.advanceTimersByTimeAsync(300)
    expect(state.resolved).toBe(false)

    head.call('dom:rendered')
    await vi.advanceTimersByTimeAsync(0)
    expect(state.resolved).toBe(true)
  })

  it('should unsubscribe from head hooks once resolved', async () => {
    const head = fakeHead(true)
    const state = track(createHeadRender(head).nextHeadRender(true))

    head.call('entries:updated')
    head.call('dom:rendered')
    await vi.advanceTimersByTimeAsync(0)

    expect(state.resolved).toBe(true)
    expect(head.listenerCount()).toBe(0)
  })
})
