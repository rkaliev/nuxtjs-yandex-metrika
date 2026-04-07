export interface YandexMetrikaInitOptions {
  accurateTrackBounce?: boolean | number
  clickmap?: boolean
  defer?: boolean
  ecommerce?: boolean | string
  trackLinks?: boolean
  triggerEvent?: boolean
  ut?: string
  webvisor?: boolean
}

export interface ModuleOptions extends YandexMetrikaInitOptions {
  id?: string
  useCDN?: boolean
  disabled?: boolean
  debug?: boolean
  noJS?: boolean
  autoTracking?: boolean
}

export interface HitOptions {
  callback?: () => void
  ctx?: unknown
  params?: Record<string, unknown>
  referer?: string
  title?: string
}

export interface YandexMetrikaApi {
  hit(url: string, options?: HitOptions): void
  reachGoal(target: string, params?: Record<string, unknown>, callback?: () => void, ctx?: unknown): void
  params(params: Record<string, unknown>): void
  userParams(params: Record<string, unknown>): void
  getClientID(callback: (clientID: string) => void): void
  setUserID(userID: string): void
  notBounce(options?: Record<string, unknown>): void
  addFileExtension(extensions: string | string[]): void
  extLink(url: string, options?: Record<string, unknown>): void
  file(url: string, options?: Record<string, unknown>): void
  replacePhones(): void
}

// Type augmentations are in types.augment.d.ts (loaded by Nuxt at runtime)
