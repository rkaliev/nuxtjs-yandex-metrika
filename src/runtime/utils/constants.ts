import type { ModuleOptions } from '../types'

export const SCRIPT_URL = 'https://mc.yandex.ru/metrika/tag.js'
export const SCRIPT_URL_CDN = 'https://cdn.jsdelivr.net/npm/yandex-metrica-watch/tag.js'
export const NOSCRIPT_PIXEL_URL = 'https://mc.yandex.ru/watch'

export const DEFAULT_OPTIONS: Required<ModuleOptions> = {
  id: '',
  accurateTrackBounce: true,
  clickmap: true,
  defer: true,
  ecommerce: false,
  trackLinks: true,
  triggerEvent: true,
  ut: 'noindex',
  webvisor: false,
  useCDN: false,
  disabled: false,
  debug: false,
  noJS: true,
  autoTracking: true,
}
