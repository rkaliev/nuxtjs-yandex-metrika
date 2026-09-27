import { defineNuxtModule, addPlugin, addImports, createResolver, useLogger } from '@nuxt/kit'
import { defu } from 'defu'
import type { ModuleOptions } from './runtime/types'
import { DEFAULT_OPTIONS, NOSCRIPT_PIXEL_URL } from './runtime/utils/constants'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@rkaliev/nuxt-yandex-metrika',
    configKey: 'yandexMetrika',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: DEFAULT_OPTIONS,
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Resolve counter ID from options or env
    const id = options.id
      || process.env.NUXT_PUBLIC_YANDEX_METRIKA_ID
      || process.env.YM_ID
      || ''

    const resolvedOptions: Required<ModuleOptions> = defu(
      { id },
      options,
      DEFAULT_OPTIONS,
    ) as Required<ModuleOptions>

    if (!resolvedOptions.id && !resolvedOptions.disabled) {
      // Created in setup so it follows the logLevel Nuxt applies
      useLogger('nuxt-yandex-metrika').warn('Counter ID is not set. Set yandexMetrika.id or NUXT_PUBLIC_YANDEX_METRIKA_ID (it can also be set at runtime); until then the mock API is used.')
    }

    // Merge into runtimeConfig.public
    nuxt.options.runtimeConfig.public.yandexMetrika = defu(
      nuxt.options.runtimeConfig.public.yandexMetrika as ModuleOptions | undefined,
      resolvedOptions,
    ) as Required<ModuleOptions>

    // noJS: inject noscript pixel
    if (resolvedOptions.noJS && resolvedOptions.id && !resolvedOptions.disabled) {
      const noscript = nuxt.options.app.head.noscript = nuxt.options.app.head.noscript || []
      ;(noscript as Array<Record<string, string>>).push({
        innerHTML: `<div><img src="${NOSCRIPT_PIXEL_URL}/${resolvedOptions.id}" style="position:absolute;left:-9999px;" alt=""/></div>`,
      })
    }

    // Register client plugin
    addPlugin({
      src: resolver.resolve('./runtime/plugin.client'),
      mode: 'client',
    })

    // Auto-import composable
    addImports({
      name: 'useYandexMetrika',
      from: resolver.resolve('./runtime/composables/useYandexMetrika'),
    })
  },
})
