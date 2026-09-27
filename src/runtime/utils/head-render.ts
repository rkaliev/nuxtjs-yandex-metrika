// Safety net in case a pending head render never happens
const HEAD_RENDER_TIMEOUT_MS = 1000
// After app:error: longer than loading the lazy part of Nuxt's default error page, short enough that leaving it rarely drops the hit
const ERROR_PAGE_HEAD_GRACE_MS = 300

/** The part of the unhead client used here; structural, so it fits both unhead v2 and v3 */
export interface HeadRenderSource {
  dirty?: boolean
  hooks?: {
    hook(name: 'dom:rendered' | 'entries:updated', fn: () => void): () => void
  }
}

export interface HeadRender {
  nextHeadRender: (afterUpdate?: boolean) => Promise<void>
  headRendered: () => Promise<void>
}

export function createHeadRender(head: HeadRenderSource): HeadRender {
  // `afterUpdate`: skip renders of updates made before the call, wait for a render that follows a new head update.
  // Without an update within the grace window the page's head is already in place (e.g. a synchronous error.vue)
  const nextHeadRender = (afterUpdate = false): Promise<void> =>
    new Promise((resolve) => {
      let offRender: (() => void) | undefined
      const done = () => {
        clearTimeout(timer)
        clearTimeout(grace)
        offUpdate?.()
        offRender?.()
        // A macrotask later: unhead v2 clears `dirty` in a finally that runs after dom:rendered
        setTimeout(resolve)
      }
      const timer = setTimeout(done, HEAD_RENDER_TIMEOUT_MS)
      const waitForRender = () => {
        offRender = head.hooks?.hook('dom:rendered', done)
      }
      const grace = afterUpdate
        ? setTimeout(() => {
            offUpdate?.()
            if (head.dirty) waitForRender()
            else done()
          }, ERROR_PAGE_HEAD_GRACE_MS)
        : undefined
      const offUpdate = afterUpdate
        ? head.hooks?.hook('entries:updated', () => {
            clearTimeout(grace)
            offUpdate?.()
            waitForRender()
          })
        : undefined
      if (!afterUpdate) waitForRender()
    })
  // Nuxt renders the head after page:finish without awaiting it; `dirty` means that render is still pending
  const headRendered = (): Promise<void> => head.dirty ? nextHeadRender() : Promise.resolve()

  return { nextHeadRender, headRendered }
}
