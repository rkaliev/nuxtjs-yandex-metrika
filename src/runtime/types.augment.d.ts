import type { YandexMetrikaApi, ModuleOptions } from './types'

declare module '#app' {
  interface NuxtApp {
    $yandexMetrika: YandexMetrikaApi
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $yandexMetrika: YandexMetrikaApi
  }
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    yandexMetrika: Required<ModuleOptions>
  }
}
