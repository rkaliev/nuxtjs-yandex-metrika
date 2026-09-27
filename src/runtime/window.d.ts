// Internal: not part of the consumer type template, so it cannot clash with other Metrika typings
declare global {
  interface Window {
    ym: ((...args: unknown[]) => void) & { a?: unknown[], l?: number }
  }
}

export {}
