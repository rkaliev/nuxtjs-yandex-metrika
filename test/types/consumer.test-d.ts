// Compile-time checks of what a consumer app sees; run by `npm run test:types`
import { expectTypeOf } from 'vitest'
import type { ComponentCustomProperties } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#imports'
import type { YandexMetrikaApi, HitOptions, YandexMetrikaInitOptions } from '../../src/module'
import type { ModuleOptions } from '../../src/runtime/types'

// Nuxt also infers these two from the plugin's provide, so they hold without the template's #app/vue blocks
expectTypeOf(useNuxtApp().$yandexMetrika).toEqualTypeOf<YandexMetrikaApi>()
expectTypeOf<ComponentCustomProperties['$yandexMetrika']>().toEqualTypeOf<YandexMetrikaApi>()
expectTypeOf(useRuntimeConfig().public.yandexMetrika).toEqualTypeOf<Required<ModuleOptions>>()
expectTypeOf<HitOptions['title']>().toEqualTypeOf<string | undefined>()
expectTypeOf<YandexMetrikaApi['grantConsent']>().toEqualTypeOf<() => void>()
expectTypeOf<YandexMetrikaInitOptions['webvisor']>().toEqualTypeOf<boolean | undefined>()
expectTypeOf<YandexMetrikaInitOptions['trackHash']>().toEqualTypeOf<boolean | undefined>()
expectTypeOf<YandexMetrikaInitOptions['sendTitle']>().toEqualTypeOf<boolean | undefined>()
expectTypeOf<YandexMetrikaInitOptions['childIframe']>().toEqualTypeOf<boolean | undefined>()
expectTypeOf<YandexMetrikaInitOptions['disableYtm']>().toEqualTypeOf<boolean | undefined>()
expectTypeOf<YandexMetrikaInitOptions['type']>().toEqualTypeOf<number | undefined>()
expectTypeOf<YandexMetrikaInitOptions['params']>().toEqualTypeOf<Record<string, unknown> | unknown[] | undefined>()
expectTypeOf<YandexMetrikaInitOptions['userParams']>().toEqualTypeOf<Record<string, unknown> | undefined>()
expectTypeOf<YandexMetrikaInitOptions['trustedDomains']>().toEqualTypeOf<string[] | undefined>()

// @ts-expect-error the hit url is a string
useNuxtApp().$yandexMetrika.hit(123)

// @ts-expect-error the counter id is a string
useRuntimeConfig().public.yandexMetrika.id = 1

// @ts-expect-error the counter type is a number
useRuntimeConfig().public.yandexMetrika.type = '1'
