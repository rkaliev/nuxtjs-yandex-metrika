# @rkaliev/nuxt-yandex-metrika

Nuxt 3 module for [Yandex Metrika](https://metrika.yandex.ru/).

## Features

- Nuxt 3 with TypeScript support
- SSR-safe composable `useYandexMetrika()`
- Auto-tracking page navigations
- Mock API in development mode with debug logging
- Graceful fallback on script load failure
- `<noscript>` pixel support

## Installation

```bash
npm install @rkaliev/nuxt-yandex-metrika
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
| `accurateTrackBounce` | `boolean` | `true` | Accurate bounce tracking |
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

### Environment variables

You can set the counter ID via environment variables instead of `nuxt.config.ts`:

```
NUXT_PUBLIC_YANDEX_METRIKA_ID=12345678
# or
YM_ID=12345678
```

## How it works

- **Production**: Loads `tag.js`, initializes the counter, provides real API
- **Development**: Uses mock API (with optional debug logging)
- **SSR**: Returns noop API on server, real/mock on client
- **Script failure**: Falls back to mock API with `console.error`

## Migration from v1

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

## Development

```bash
npm install
npm run dev        # Start playground
npm run build      # Build module
npm run test       # Run tests
```

## License

[MIT](./LICENSE)
