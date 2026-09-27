# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

Statistics change after upgrading: the entry page is counted (page views go up, most visibly for single-page sessions), failed navigations and navigations to the same URL are no longer counted, and hits carry the title of their page. See [Upgrading to 3.1](./README.md#upgrading-to-31).

### Added

- Types for consumer apps: `$yandexMetrika` (`useNuxtApp()` and templates) is `YandexMetrikaApi`, `useRuntimeConfig().public.yandexMetrika` is `Required<ModuleOptions>`
- `YandexMetrikaApi`, `HitOptions` and `YandexMetrikaInitOptions` are exported from the package (`import type { … } from '@rkaliev/nuxt-yandex-metrika'`)
- Known limitation: with `skipLibCheck: false` TypeScript reports TS2430 on `PublicRuntimeConfig`, because Nuxt infers a narrower type from the default values; the Nuxt default `skipLibCheck: true` is unaffected

### Changed

- The missing counter id warning is printed at build time (and in the dev browser) instead of in the production browser
- `engines.node` aligned with Nuxt 4.5: `^22.19.0 || ^24.11.0 || >=26.0.0` (Node 20 reached end-of-life on 2026-04-30)

### Fixed

- The entry page is now tracked: auto-tracking sends a hit for it (previously the first navigation was skipped)
- Auto-tracking sends a hit once the page has rendered, with its `title`; no hit for failed navigations or when the URL did not change
- Hit URLs and referers include `app.baseURL`
- Loading `tag.js` no longer blocks hydration; calls are queued until it loads, and the API still falls back to the mock if the load fails
- `tag.js` is not inserted again when it is already on the page
- The `<noscript>` pixel is rendered on Nuxt 4 (`innerHTML` instead of `children`, which unhead v2 ignores)
- Published runtime type declarations (`dist/runtime/**/*.d.ts`) were empty: module options and `useYandexMetrika()` are now typed for consumers

## [3.0.0] - 2026-04-08

### Breaking

- Minimum Nuxt version: 4.0.0 (drop Nuxt 3 support)
- Minimum Node.js version: 18

### Changed

- Update @nuxt/kit to ^4.0.0
- Update @nuxt/test-utils to ^4.0.0
- Update vitest to ^4.0.0
- Migrate playground to Nuxt 4 directory structure

## [2.0.4] - 2026-04-08

### Added

- CHANGELOG.md
- `engines` field in package.json (node >=18)
- `peerDependencies` field in package.json (nuxt ^3.16.0)
- Git tags and GitHub Releases for v2.0.2 and v2.0.3

## [2.0.3] - 2026-04-07

### Fixed

- Update package.json exports for @nuxt/module-builder v1

### Changed

- Bump esbuild and @nuxt/module-builder dependencies
- Bump happy-dom dependency

## [2.0.2] - 2026-04-07

### Changed

- Complete rewrite for Nuxt 3 with TypeScript
- Three-tier plugin strategy: disabled → mock (dev) → real (prod)
- `defer: true` by default (SPA mode — manual hit tracking)
- SSR safety via noop API on server, client-only plugin
- Composable `useYandexMetrika()` as primary API
- Config via `runtimeConfig.public.yandexMetrika`
