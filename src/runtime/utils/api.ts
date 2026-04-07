import type { ModuleOptions, YandexMetrikaApi } from '../types'

export function createRealApi(id: string): YandexMetrikaApi {
  function call(method: string, ...args: unknown[]) {
    if (typeof window.ym === 'function') {
      window.ym(id, method, ...args)
    }
  }

  return {
    hit(url, options) { call('hit', url, options) },
    reachGoal(target, params, callback, ctx) { call('reachGoal', target, params, callback, ctx) },
    params(params) { call('params', params) },
    userParams(params) { call('userParams', params) },
    getClientID(callback) { call('getClientID', callback) },
    setUserID(userID) { call('setUserID', userID) },
    notBounce(options) { call('notBounce', options) },
    addFileExtension(extensions) { call('addFileExtension', extensions) },
    extLink(url, options) { call('extLink', url, options) },
    file(url, options) { call('file', url, options) },
    replacePhones() { call('replacePhones') },
  }
}

const INIT_OPTION_KEYS: (keyof ModuleOptions)[] = [
  'accurateTrackBounce',
  'clickmap',
  'defer',
  'ecommerce',
  'trackLinks',
  'triggerEvent',
  'ut',
  'webvisor',
]

export function buildInitOptions(config: ModuleOptions): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of INIT_OPTION_KEYS) {
    if (config[key] !== undefined) {
      result[key] = config[key]
    }
  }
  return result
}
