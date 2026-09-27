# @rkaliev/nuxt-yandex-metrika

Nuxt 4 module for [Yandex Metrika](https://metrika.yandex.ru/).

## Features

- Nuxt 4, typed API, typed `$yandexMetrika` and runtime config
- SSR-safe composable `useYandexMetrika()`
- Auto-tracking of page views, including the entry page, with page titles
- Mock API in development mode with debug logging
- Graceful fallback on script load failure
- `<noscript>` pixel support

## Installation

```bash
npm install @rkaliev/nuxt-yandex-metrika@3
```

## Configuration

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@rkaliev/nuxt-yandex-metrika'],
  yandexMetrika: {
    id: '12345678', // or env NUXT_PUBLIC_YANDEX_METRIKA_ID / YM_ID
  },
})
```

### All options

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | `''` | Yandex Metrika counter ID |
| `disabled` | `boolean` | `false` | Disable tracking entirely |
| `debug` | `boolean` | `false` | Log all API calls to console |
| `useCDN` | `boolean` | `false` | Use CDN for tag.js |
| `noJS` | `boolean` | `true` | Inject `<noscript>` pixel |
| `autoTracking` | `boolean` | `true` | Auto-track page navigations |
| `clickmap` | `boolean` | `true` | Enable click map |
| `trackLinks` | `boolean` | `true` | Track outbound links |
| `accurateTrackBounce` | `boolean \| number` | `true` | Accurate bounce tracking (a number sets the bounce threshold in ms) |
| `webvisor` | `boolean` | `false` | Enable Webvisor |
| `defer` | `boolean` | `true` | Deferred initialization |
| `triggerEvent` | `boolean` | `true` | Trigger `yacounter<id>inited` event |
| `ecommerce` | `boolean \| string` | `false` | E-commerce data layer |
| `ut` | `string` | `'noindex'` | User tracking parameter |

## Usage

### Composable (recommended)

```vue
<script setup>
const ym = useYandexMetrika()

function onBuy() {
  ym.reachGoal('purchase', { price: 1000 })
}
</script>
```

### API methods

| Method | Description |
|---|---|
| `hit(url, options?)` | Track page view |
| `reachGoal(target, params?, callback?, ctx?)` | Track goal |
| `params(params)` | Set session parameters |
| `userParams(params)` | Set user parameters |
| `setUserID(userID)` | Set user ID |
| `getClientID(callback)` | Get client ID |
| `notBounce(options?)` | Mark as not bounce |
| `addFileExtension(ext)` | Add file extension for tracking |
| `extLink(url, options?)` | Track external link |
| `file(url, options?)` | Track file download |
| `replacePhones()` | Replace phone numbers |

### `$yandexMetrika`

The same API is available as `$yandexMetrika`: `useNuxtApp().$yandexMetrika` and `$yandexMetrika` in templates. It exists on the client only; use `useYandexMetrika()` in code that also runs on the server.

### TypeScript

`useYandexMetrika()`, `$yandexMetrika` (`useNuxtApp()` and templates) and `useRuntimeConfig().public.yandexMetrika` are typed without extra setup. The API types are exported from the package:

```ts
import type { YandexMetrikaApi, HitOptions, YandexMetrikaInitOptions, ModuleOptions } from '@rkaliev/nuxt-yandex-metrika'
```

With `skipLibCheck: false` in your tsconfig, TypeScript reports TS2430 on `PublicRuntimeConfig`: Nuxt infers a narrower type for `yandexMetrika` from the default values. The Nuxt default `skipLibCheck: true` is not affected.

### Environment variables

You can set the counter ID via environment variables instead of `nuxt.config.ts`:

```
NUXT_PUBLIC_YANDEX_METRIKA_ID=12345678
# or
YM_ID=12345678
```

`YM_ID` is read at build time only. `NUXT_PUBLIC_YANDEX_METRIKA_ID` is read at build time and, as a Nuxt runtime config override, when the server starts. The `<noscript>` pixel is rendered only when the ID is known at build time.

## How it works

- **Production**: loads `tag.js` in the background without blocking hydration and initializes the counter. Calls made before the script loads are queued and sent once it loads. If `tag.js` is already on the page, it is not inserted again.
- **Development**: uses the mock API; with `debug: true` it logs every call to the console
- **SSR**: `useYandexMetrika()` returns a noop API on the server, the real or mock API on the client
- **Script failure**: falls back to the mock API with `console.error`
- **No counter ID**: the build prints a warning (unless `disabled: true`) and the mock API is used
- **`disabled: true`**: the mock API is used and nothing is sent

### Auto-tracking

With `autoTracking: true` (the default) the module sends page views with `hit()`; `defer: true` keeps the counter from sending its own automatic hit, so each page is counted once.

- The entry page is tracked; Metrika takes its referer from `document.referrer`
- Every client-side navigation to a new URL is tracked, including a change of the query only. The `referer` is the previous tracked URL
- The hit is sent once the page has rendered, with its `title`
- No hit for a failed or aborted navigation, or when the URL did not change
- URLs include `app.baseURL`
- Error pages (for example, a client-side 404) are tracked
- Prerendered (SSG) pages are tracked once, with their real URL

Known limitations:

- Navigation hits rely on the page hooks of `<NuxtPage>`. An app without `<NuxtPage>` gets only the entry page hit and hits for error pages; send the others with `hit()`.
- When an async page throws a fatal error after setting its title, the hit carries that page's title instead of the error page's.
- When an async page's setup throws a non-fatal error, that page and its query changes are not tracked until the next page renders.

## Migration from v1 (to v2)

### Breaking changes

- Package renamed: `@rkaliev/nuxtjs-yandex-metrika` → `@rkaliev/nuxt-yandex-metrika`
- Requires Nuxt 3+
- `this.$yandexMetrika` → `useYandexMetrika()` composable (or `$yandexMetrika` via `useNuxtApp()`)
- `defer: true` is now the default
- `noJS: true` is now the default

### Migration steps

1. Update package: `npm install @rkaliev/nuxt-yandex-metrika@2`
2. Update `nuxt.config.ts`:
   ```diff
   - modules: ['@rkaliev/nuxtjs-yandex-metrika'],
   + modules: ['@rkaliev/nuxt-yandex-metrika'],
   ```
3. Replace `this.$yandexMetrika` with `useYandexMetrika()` in components

## Upgrading to 3.1

No code changes are needed. Check the supported Node.js versions in `engines` of [`package.json`](./package.json).

Auto-tracking statistics change after the upgrade:

- The entry page is counted: page views go up, most visibly for single-page sessions
- Failed navigations and navigations to the same URL are no longer counted
- Hits carry the title of the page they belong to

See the [changelog](./CHANGELOG.md) for the full list.

## Migration from v2 (to v3)

### Breaking changes

- Requires Nuxt 4.0.0+
- Requires Node.js 18+ (3.1 raises it, see [Upgrading to 3.1](#upgrading-to-31))

### Migration steps

1. Update package: `npm install @rkaliev/nuxt-yandex-metrika@3`
2. No API changes — updating the dependency is sufficient

> **Still on Nuxt 3?** Use the v2 line: `npm install @rkaliev/nuxt-yandex-metrika@nuxt3`

## Development

```bash
npm ci
npm run dev:prepare  # Generate .nuxt/ types; needed after every install
npm run dev          # Start the playground on http://localhost:3000
npm run lint         # ESLint
npm run test:types   # Type-check the module, tests and playground
npm test             # Unit and integration tests
npm run test:e2e     # Browser tests (first run: npx playwright-core install chromium)
npm run build        # Build the module into dist/
```

## License

[MIT](./LICENSE)
