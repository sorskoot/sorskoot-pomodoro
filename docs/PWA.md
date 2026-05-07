# PWA Service Worker

The service worker is registered in `src/pwa.ts` using `import.meta.env.BASE_URL`,
which Vite replaces statically at build time with the configured `base` path.

## How it works

`PWA_BASE_PATH` is computed once at module load:

```typescript
const rawBase = import.meta.env.BASE_URL;
export const PWA_BASE_PATH = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
```

The trailing slash is normalized so the registration is always valid regardless of
whether the build tool includes it.

## Development

`vite.config.ts` sets `base: './'`. In dev mode Vite resolves this to `/`, so:

- Service worker registered at: `/sw.js`
- Scope: `/`

## Production — GitHub Pages

Build with the sub-path as `--base`:

```bash
npm run build -- --base=/sorskoot-pomodoro/
```

This sets `import.meta.env.BASE_URL` to `/sorskoot-pomodoro/` in the bundle, so:

- Service worker registered at: `/sorskoot-pomodoro/sw.js`
- Scope: `/sorskoot-pomodoro/`

The GitHub Actions deploy workflow passes this flag automatically.

## Deploying to a different sub-path

Replace `/sorskoot-pomodoro/` with your own path:

```bash
npm run build -- --base=/my-app/
```

No code changes are required — `PWA_BASE_PATH` is derived entirely from `BASE_URL`.
