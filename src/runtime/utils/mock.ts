import type { YandexMetrikaApi } from '../types'

const LOG_PREFIX = '[nuxt-yandex-metrika]'

export function createMockApi(debug: boolean): YandexMetrikaApi {
  function log(method: string, ...args: unknown[]) {
    if (debug) {
      console.log(`${LOG_PREFIX} ${method}:`, ...args)
    }
  }

  return {
    hit(url, options) { log('hit', url, options) },
    reachGoal(target, params, callback, ctx) { log('reachGoal', target, params, callback, ctx) },
    params(params) { log('params', params) },
    userParams(params) { log('userParams', params) },
    getClientID(callback) { log('getClientID', callback) },
    setUserID(userID) { log('setUserID', userID) },
    notBounce(options) { log('notBounce', options) },
    addFileExtension(extensions) { log('addFileExtension', extensions) },
    extLink(url, options) { log('extLink', url, options) },
    file(url, options) { log('file', url, options) },
    replacePhones() { log('replacePhones') },
  }
}

export function createNoopApi(): YandexMetrikaApi {
  return {
    hit() {},
    reachGoal() {},
    params() {},
    userParams() {},
    getClientID() {},
    setUserID() {},
    notBounce() {},
    addFileExtension() {},
    extLink() {},
    file() {},
    replacePhones() {},
  }
}
