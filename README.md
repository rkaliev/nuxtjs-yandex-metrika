# @rkaliev/nuxt-yandex-metrika

Nuxt 4 module for [Yandex Metrika](https://metrika.yandex.ru/).

## Features

- Nuxt 4, typed API, typed `$yandexMetrika` and runtime config
- SSR-safe composable `useYandexMetrika()`
- Auto-tracking of page views, including the entry page, with page titles
- Mock API in development mode with debug logging
- Graceful fallback on script load failure
- `<noscript>` pixel support
- Waiting for cookie consent (`requireConsent`): nothing is loaded or sent before `grantConsent()`

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
| `requireConsent` | `boolean` | `false` | Start the counter only after `grantConsent()` (see [Cookie consent](#cookie-consent)) |
| `clickmap` | `boolean` | `true` | Enable click map |
| `trackLinks` | `boolean` | `true` | Track outbound links |
| `accurateTrackBounce` | `boolean \| number` | `true` | Accurate bounce tracking (a number sets the bounce threshold in ms) |
| `webvisor` | `boolean` | `false` | Enable Webvisor |
| `defer` | `boolean` | `true` | Deferred initialization |
| `triggerEvent` | `boolean` | `true` | Trigger `yacounter<id>inited` event |
| `ecommerce` | `boolean \| string` | `false` | E-commerce data layer |
| `ut` | `string` | `'noindex'` | User tracking parameter |
| `trackHash` | `boolean` | `false` | Track hash changes in the address bar (see [Auto-tracking](#auto-tracking)) |
| `sendTitle` | `boolean` | `true` | Send page titles; set `false` if titles contain private data |
| `childIframe` | `boolean` | `false` | Record the content of iframes without a counter |
| `trustedDomains` | `string[]` | `[]` | Trusted domains for recording the content of a child iframe |
| `disableYtm` | `boolean` | `false` | Turn off Yandex Tag Manager on the page |
| `type` | `number` | `0` | Counter type (`1` for the Yandex Advertising Network) |
| `params` | `object \| array` | `{}` | Session parameters sent on init (an empty value is not sent) |
| `userParams` | `object` | `{}` | User parameters sent on init (an empty value is not sent) |

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
| `grantConsent()` | Start the counter when `requireConsent` is set (does nothing otherwise) |

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

- **Production**: loads `tag.js` in the background without blocking hydration and initializes the counter. Calls made before the script loads are queued and sent once it loads. If `tag.js` is already on the page (from `mc.yandex.ru` or the jsDelivr mirror, including the official snippet's `tag.js?id=…`), it is not inserted again.
- **Development**: uses the mock API; with `debug: true` it logs every call to the console
- **SSR**: `useYandexMetrika()` returns a noop API on the server, the real or mock API on the client
- **Script failure**: falls back to the mock API with `console.error`
- **No counter ID**: the build prints a warning (unless `disabled: true`) and the mock API is used
- **`disabled: true`**: the mock API is used and nothing is sent

### Auto-tracking

With `autoTracking: true` (the default) the module sends page views with `hit()`; `defer: true` keeps the counter from sending its own automatic hit, so each page is counted once.

- The entry page is tracked; Metrika takes its referer from `document.referrer`
- Every client-side navigation to a new URL is tracked, including a change of the query only. The `referer` is the previous tracked URL
- The hit is sent once the page has rendered, with its `title`. With `sendTitle: false` the hit has no `title` and is sent as soon as the page is ready
- No hit for a failed or aborted navigation, or when the URL did not change
- URLs include `app.baseURL`
- Error pages (for example, a client-side 404) are tracked
- Prerendered (SSG) pages are tracked once, with their real URL

Router hash changes (`router.push('#section')`, `<NuxtLink to="#section">`) are tracked like any other URL change. `trackHash: true` makes Metrika count hash changes too, so a hash change can be counted twice; the build warns about this combination. Use one of them: `trackHash` with `autoTracking: false`, or `autoTracking` alone.

Known limitations:

- Navigation hits rely on the page hooks of `<NuxtPage>`. An app without `<NuxtPage>` gets only the entry page hit and hits for error pages; send the others with `hit()`.
- When an async page throws a fatal error after setting its title, the hit carries that page's title instead of the error page's.
- When an async page's setup throws a non-fatal error, that page and its query changes are not tracked until the next page renders.
- An error page hit waits up to 300 ms for the error page's head. If the error page loads its content lazily and that takes longer (Nuxt's default error page on a slow first load), the hit carries the previous page's title.

### Cookie consent

For sites that need consent to cookies before analytics runs (for example, under 152-FZ), set `requireConsent: true`:

```ts
export default defineNuxtConfig({
  yandexMetrika: {
    id: '12345678',
    requireConsent: true,
  },
})
```

Until `grantConsent()` is called, `tag.js` is not loaded, the counter is not initialized, and nothing is sent. Calls made before consent (`reachGoal()`, `hit()`, auto-tracking page views) are dropped, not queued; with `debug: true` each one logs `dropped, waiting for consent: <method>`. The `<noscript>` pixel is not added, because it would set cookies for visitors without JavaScript, where consent can't stop it.

Call `grantConsent()` when the visitor accepts:

```vue
<script setup>
const ym = useYandexMetrika()

function accept() {
  saveConsent() // your banner stores the choice
  ym.grantConsent()
}
</script>
```

After consent the counter starts and sends a hit for the current page, without a referer: pages viewed before consent are never sent, not even as a referer. Later navigations are tracked as usual. A second `grantConsent()` does nothing.

The module does not remember consent. Your app stores it (a cookie or `localStorage`) and calls `grantConsent()` on every page load once the visitor has agreed, for example in a client plugin. Withdrawing consent takes a page reload without `grantConsent()`: a loaded `tag.js` can't be unloaded.

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

### Releasing

Versions are published to npm by the manual `Release` workflow (`.github/workflows/release.yml`) with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers), so no npm token is needed and each version gets provenance.

One-time setup:

1. GitHub: Settings → Environments → create `npm` (optionally with required reviewers).
2. npmjs.com: package settings → Trusted publishing → GitHub Actions, repository `rkaliev/nuxtjs-yandex-metrika`, workflow `release.yml`, environment `npm`.

For each release:

1. Bump `version` in `package.json`, add the `CHANGELOG.md` entry, push to `master` and wait for CI.
2. Tag the commit: `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. Actions → Release → Run workflow with the tag. `dry-run` is on by default: it runs every check and `npm publish --dry-run`.
4. Run it again with `dry-run` off to publish. Use `dist-tag` for a release that must not become `latest`.
5. Create the GitHub Release for the tag.

## License

[MIT](./LICENSE)
