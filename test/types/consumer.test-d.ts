// Compile-time checks of what a consumer app sees; run by `npm run test:types`
import { expectTypeOf } from 'vitest'
import type { ComponentCustomProperties } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#imports'
import type { YandexMetrikaApi, HitOptions, YandexMetrikaInitOptions } from '../../src/module'
import type { ModuleOptions } from '../../src/runtime/types'

expectTypeOf(useNuxtApp().$yandexMetrika).toEqualTypeOf<YandexMetrikaApi>()
expectTypeOf<ComponentCustomProperties['$yandexMetrika']>().toEqualTypeOf<YandexMetrikaApi>()
expectTypeOf(useRuntimeConfig().public.yandexMetrika).toEqualTypeOf<Required<ModuleOptions>>()
expectTypeOf<HitOptions['title']>().toEqualTypeOf<string | undefined>()
expectTypeOf<YandexMetrikaInitOptions['webvisor']>().toEqualTypeOf<boolean | undefined>()

// @ts-expect-error the hit url is a string
useNuxtApp().$yandexMetrika.hit(123)

// @ts-expect-error the counter id is a string
useRuntimeConfig().public.yandexMetrika.id = 1
