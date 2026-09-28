# @rkaliev/nuxt-yandex-metrika

**Русский** | [English](https://github.com/rkaliev/nuxtjs-yandex-metrika/blob/master/README.en.md)

Модуль Nuxt 4 для [Яндекс Метрики](https://metrika.yandex.ru/).

## Возможности

- Nuxt 4, типизированный API, типизированные `$yandexMetrika` и runtime config
- Composable `useYandexMetrika()`, безопасный для SSR
- Автоматический учёт просмотров страниц, включая страницу входа, с заголовками страниц
- Mock API в режиме разработки с отладочным логированием
- Корректный откат, если скрипт не загрузился
- Поддержка пикселя `<noscript>`
- Ожидание согласия на cookie (`requireConsent`): до вызова `grantConsent()` ничего не загружается и не отправляется

## Установка

```bash
npm install @rkaliev/nuxt-yandex-metrika@3
```

## Настройка

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@rkaliev/nuxt-yandex-metrika'],
  yandexMetrika: {
    id: '12345678', // или переменная окружения NUXT_PUBLIC_YANDEX_METRIKA_ID / YM_ID
  },
})
```

### Все опции

| Опция | Тип | По умолчанию | Описание |
|---|---|---|---|
| `id` | `string` | `''` | Номер счётчика Яндекс Метрики |
| `disabled` | `boolean` | `false` | Полностью отключить сбор статистики |
| `debug` | `boolean` | `false` | Выводить все вызовы API в консоль |
| `useCDN` | `boolean` | `false` | Загружать tag.js с CDN |
| `noJS` | `boolean` | `true` | Добавить пиксель `<noscript>` |
| `autoTracking` | `boolean` | `true` | Автоматически учитывать переходы между страницами |
| `requireConsent` | `boolean` | `false` | Запускать счётчик только после `grantConsent()` (см. [Согласие на cookie](#согласие-на-cookie)) |
| `clickmap` | `boolean` | `true` | Карта кликов |
| `trackLinks` | `boolean` | `true` | Учёт переходов по внешним ссылкам |
| `accurateTrackBounce` | `boolean \| number` | `true` | Точный показатель отказов (число задаёт порог отказа в мс) |
| `webvisor` | `boolean` | `false` | Вебвизор |
| `defer` | `boolean` | `true` | Отложенная инициализация |
| `triggerEvent` | `boolean` | `true` | Генерировать событие `yacounter<id>inited` |
| `ecommerce` | `boolean \| string` | `false` | Контейнер данных электронной коммерции |
| `ut` | `string` | `'noindex'` | Параметр `ut` (запрет индексации страниц) |
| `trackHash` | `boolean` | `false` | Учитывать изменение хеша в адресной строке (см. [Автотрекинг](#автотрекинг)) |
| `sendTitle` | `boolean` | `true` | Передавать заголовки страниц; поставьте `false`, если в заголовках есть личные данные |
| `childIframe` | `boolean` | `false` | Записывать содержимое iframe без счётчика |
| `trustedDomains` | `string[]` | `[]` | Доверенные домены для записи содержимого дочернего iframe |
| `disableYtm` | `boolean` | `false` | Отключить Yandex Tag Manager на странице |
| `type` | `number` | `0` | Тип счётчика (`1` для Рекламной сети Яндекса) |
| `params` | `object \| array` | `{}` | Параметры визита, передаются при инициализации (пустое значение не передаётся) |
| `userParams` | `object` | `{}` | Параметры посетителя, передаются при инициализации (пустое значение не передаётся) |

## Использование

### Composable (рекомендуется)

```vue
<script setup>
const ym = useYandexMetrika()

function onBuy() {
  ym.reachGoal('purchase', { price: 1000 })
}
</script>
```

### Методы API

| Метод | Описание |
|---|---|
| `hit(url, options?)` | Отправить просмотр страницы |
| `reachGoal(target, params?, callback?, ctx?)` | Отправить достижение цели |
| `params(params)` | Передать параметры визита |
| `userParams(params)` | Передать параметры посетителя |
| `setUserID(userID)` | Передать ID посетителя |
| `getClientID(callback)` | Получить ClientID |
| `notBounce(options?)` | Отметить визит как неотказ |
| `addFileExtension(ext)` | Добавить расширение файлов для учёта скачиваний |
| `extLink(url, options?)` | Отправить переход по внешней ссылке |
| `file(url, options?)` | Отправить скачивание файла |
| `replacePhones()` | Подменить номера телефонов |
| `grantConsent()` | Запустить счётчик, если задан `requireConsent` (иначе ничего не делает) |

### `$yandexMetrika`

Тот же API доступен как `$yandexMetrika`: `useNuxtApp().$yandexMetrika` и `$yandexMetrika` в шаблонах. Он есть только на клиенте; в коде, который выполняется и на сервере, используйте `useYandexMetrika()`.

### TypeScript

`useYandexMetrika()`, `$yandexMetrika` (`useNuxtApp()` и шаблоны) и `useRuntimeConfig().public.yandexMetrika` типизированы без дополнительной настройки. Типы API экспортируются из пакета:

```ts
import type { YandexMetrikaApi, HitOptions, YandexMetrikaInitOptions, ModuleOptions } from '@rkaliev/nuxt-yandex-metrika'
```

При `skipLibCheck: false` в tsconfig TypeScript выдаёт TS2430 на `PublicRuntimeConfig`: Nuxt выводит для `yandexMetrika` более узкий тип из значений по умолчанию. Значение Nuxt по умолчанию, `skipLibCheck: true`, это не затрагивает.

### Переменные окружения

Номер счётчика можно задать переменной окружения вместо `nuxt.config.ts`:

```
NUXT_PUBLIC_YANDEX_METRIKA_ID=12345678
# или
YM_ID=12345678
```

`YM_ID` читается только при сборке. `NUXT_PUBLIC_YANDEX_METRIKA_ID` читается при сборке и, как переопределение runtime config Nuxt, при запуске сервера. Пиксель `<noscript>` добавляется, только если номер известен при сборке.

## Как это работает

- **Production**: загружает `tag.js` в фоне, не блокируя гидратацию, и инициализирует счётчик. Вызовы до загрузки скрипта ставятся в очередь и отправляются, когда он загрузится. Если `tag.js` уже есть на странице (с `mc.yandex.ru` или с зеркала jsDelivr, в том числе `tag.js?id=…` из официального кода счётчика), повторно он не вставляется.
- **Разработка**: используется mock API; с `debug: true` каждый вызов выводится в консоль
- **SSR**: на сервере `useYandexMetrika()` возвращает пустой (noop) API, на клиенте — настоящий или mock
- **Скрипт не загрузился**: переключается на mock API и пишет `console.error`
- **Не задан номер счётчика**: сборка выводит предупреждение (кроме `disabled: true`), используется mock API
- **`disabled: true`**: используется mock API, ничего не отправляется

### Автотрекинг

С `autoTracking: true` (по умолчанию) модуль отправляет просмотры страниц через `hit()`; `defer: true` не даёт счётчику отправить собственный автоматический хит, поэтому каждая страница учитывается один раз.

- Страница входа учитывается; реферер для неё Метрика берёт из `document.referrer`
- Учитывается каждый переход на клиенте на новый URL, включая изменение только query. `referer` — предыдущий учтённый URL
- Хит отправляется, когда страница отрисована, вместе с её `title`. С `sendTitle: false` хит отправляется без `title`, как только страница готова
- Хита нет, если переход не удался или был прерван, а также если URL не изменился
- URL включают `app.baseURL`
- Страницы ошибок (например, 404 на клиенте) учитываются
- Пререндеренные (SSG) страницы учитываются один раз, с настоящим URL

Изменения хеша через роутер (`router.push('#section')`, `<NuxtLink to="#section">`) учитываются как любое другое изменение URL. `trackHash: true` включает учёт изменений хеша и в самой Метрике, поэтому изменение хеша может быть учтено дважды; сборка предупреждает об этом сочетании. Используйте что-то одно: `trackHash` с `autoTracking: false` или только `autoTracking`.

Известные ограничения:

- Хиты переходов опираются на хуки страниц `<NuxtPage>`. Приложение без `<NuxtPage>` получает только хит страницы входа и хиты страниц ошибок; остальные отправляйте через `hit()`.
- Если асинхронная страница выбрасывает фатальную ошибку после того, как задала свой заголовок, хит получает заголовок этой страницы, а не страницы ошибки.
- Если setup асинхронной страницы выбрасывает нефатальную ошибку, эта страница и изменения её query не учитываются до отрисовки следующей страницы.
- Хит страницы ошибки ждёт её head до 300 мс. Если страница ошибки загружает содержимое лениво и это занимает дольше (стандартная страница ошибки Nuxt при медленной первой загрузке), хит получает заголовок предыдущей страницы.

### Согласие на cookie

Для сайтов, которым нужно согласие на cookie до запуска аналитики (например, по 152-ФЗ), задайте `requireConsent: true`:

```ts
export default defineNuxtConfig({
  yandexMetrika: {
    id: '12345678',
    requireConsent: true,
  },
})
```

Пока не вызван `grantConsent()`, `tag.js` не загружается, счётчик не инициализируется и ничего не отправляется. Вызовы до согласия (`reachGoal()`, `hit()`, просмотры страниц от автотрекинга) отбрасываются, а не копятся в очереди; с `debug: true` каждый из них пишет в консоль `dropped, waiting for consent: <method>`. Пиксель `<noscript>` не добавляется: он ставил бы cookie посетителям без JavaScript, у которых согласие его не остановит. Пиксель определяется при сборке: если вы включаете `requireConsent` только в runtime (`NUXT_PUBLIC_YANDEX_METRIKA_REQUIRE_CONSENT`), задайте ещё `noJS: false`. Колбэк `getClientID()`, переданный до согласия, никогда не вызывается.

Вызовите `grantConsent()`, когда посетитель соглашается:

```vue
<script setup>
const ym = useYandexMetrika()

function accept() {
  saveConsent() // ваш баннер сохраняет выбор
  ym.grantConsent()
}
</script>
```

После согласия счётчик запускается и отправляет хит текущей страницы без реферера: страницы, просмотренные до согласия, не отправляются никогда, даже как реферер. Дальнейшие переходы учитываются как обычно. Повторный `grantConsent()` ничего не делает.

Модуль не запоминает согласие. Ваше приложение хранит его само (cookie или `localStorage`) и вызывает `grantConsent()` при каждой загрузке страницы, если посетитель уже согласился, например в клиентском плагине. Чтобы отозвать согласие, нужна перезагрузка страницы без `grantConsent()`: загруженный `tag.js` выгрузить нельзя.

## Миграция с v1 (на v2)

### Несовместимые изменения

- Пакет переименован: `@rkaliev/nuxtjs-yandex-metrika` → `@rkaliev/nuxt-yandex-metrika`
- Требуется Nuxt 3+
- `this.$yandexMetrika` → composable `useYandexMetrika()` (или `$yandexMetrika` через `useNuxtApp()`)
- `defer: true` теперь по умолчанию
- `noJS: true` теперь по умолчанию

### Шаги миграции

1. Обновите пакет: `npm install @rkaliev/nuxt-yandex-metrika@2`
2. Обновите `nuxt.config.ts`:
   ```diff
   - modules: ['@rkaliev/nuxtjs-yandex-metrika'],
   + modules: ['@rkaliev/nuxt-yandex-metrika'],
   ```
3. Замените `this.$yandexMetrika` на `useYandexMetrika()` в компонентах

## Обновление до 3.1

Менять код не нужно. Проверьте поддерживаемые версии Node.js в `engines` в [`package.json`](./package.json).

После обновления меняется статистика автотрекинга:

- Страница входа учитывается: просмотров становится больше, заметнее всего в сессиях из одной страницы
- Неудавшиеся переходы и переходы на тот же URL больше не учитываются
- Хиты передают заголовок своей страницы

Полный список изменений — в [CHANGELOG](./CHANGELOG.md).

## Миграция с v2 (на v3)

### Несовместимые изменения

- Требуется Nuxt 4.0.0+
- Требуется Node.js 18+ (в 3.1 требование повышено, см. [Обновление до 3.1](#обновление-до-31))

### Шаги миграции

1. Обновите пакет: `npm install @rkaliev/nuxt-yandex-metrika@3`
2. API не менялся — достаточно обновить зависимость

> **Всё ещё на Nuxt 3?** Используйте линейку v2: `npm install @rkaliev/nuxt-yandex-metrika@nuxt3`

## Разработка

```bash
npm ci
npm run dev:prepare  # Сгенерировать типы .nuxt/; нужно после каждой установки
npm run dev          # Запустить playground на http://localhost:3000
npm run lint         # ESLint
npm run test:types   # Проверить типы модуля, тестов и playground
npm test             # Unit- и интеграционные тесты
npm run test:e2e     # Браузерные тесты (первый запуск: npx playwright-core install chromium)
npm run build        # Собрать модуль в dist/
```

### Выпуск версии

Версии публикуются в npm вручную запускаемым workflow `Release` (`.github/workflows/release.yml`) через [npm trusted publishing](https://docs.npmjs.com/trusted-publishers): npm-токен не нужен, у каждой версии есть provenance.

Однократная настройка:

1. GitHub: Settings → Environments → создать `npm` (можно с обязательными ревьюерами).
2. npmjs.com: настройки пакета → Trusted publishing → GitHub Actions, репозиторий `rkaliev/nuxtjs-yandex-metrika`, workflow `release.yml`, environment `npm`. В Allowed actions разрешите прямую публикацию: workflow вызывает `npm publish`.

Для каждого выпуска:

1. Поднимите `version` в `package.json`, добавьте запись в `CHANGELOG.md` (русский) и `CHANGELOG.en.md` (английский), запушьте в `master` и дождитесь CI.
2. Поставьте тег на коммит: `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. Actions → Release → Run workflow с этим тегом. `dry-run` включён по умолчанию: выполняются все проверки и `npm publish --dry-run`.
4. Запустите ещё раз с выключенным `dry-run`, чтобы опубликовать. Для версии, которая не должна стать `latest`, укажите `dist-tag`.
5. Создайте GitHub Release для тега.

## Лицензия

[MIT](./LICENSE)
