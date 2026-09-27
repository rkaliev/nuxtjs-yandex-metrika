import type { YandexMetrikaApi } from '../types'

// grantConsent is the module's own, not a Metrika method
export type MetrikaMethod = Exclude<keyof YandexMetrikaApi, 'grantConsent'>

// Every YandexMetrikaApi method with its parameter count; `satisfies` keeps both in sync with the interface
export const METRIKA_METHODS = {
  hit: 2,
  reachGoal: 4,
  params: 1,
  userParams: 1,
  getClientID: 1,
  setUserID: 1,
  notBounce: 1,
  addFileExtension: 1,
  extLink: 2,
  file: 2,
  replacePhones: 0,
} as const satisfies { [K in MetrikaMethod]: Required<Parameters<YandexMetrikaApi[K]>>['length'] }

/**
 * Builds an API whose every Metrika method forwards to `handler`, and whose `grantConsent` is `grantConsent`.
 * Arguments are padded with `undefined` or truncated to the method's parameter count.
 */
export function createApi(
  handler: (method: MetrikaMethod, args: unknown[]) => void,
  grantConsent: () => void = () => {},
): YandexMetrikaApi {
  const api: Record<string, (...args: unknown[]) => void> = {}
  for (const [method, arity] of Object.entries(METRIKA_METHODS)) {
    api[method] = (...args) => {
      handler(method as MetrikaMethod, Array.from({ length: arity }, (_, i) => args[i]))
    }
  }
  api.grantConsent = grantConsent
  return api as unknown as YandexMetrikaApi
}
