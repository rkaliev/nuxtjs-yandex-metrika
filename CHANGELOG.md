# Changelog

All notable changes to this project will be documented in this file.

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
