# PWA Deployment

## Service worker registration

The service worker is registered using `import.meta.env.BASE_URL`, which Vite
replaces statically at build time. Trailing-slash normalization is applied
automatically, so the registration path is always well-formed regardless of how
the base is specified.

Source: `src/pwa.ts`

```ts
const rawBase: string = import.meta.env.BASE_URL;
export const PWA_BASE_PATH: string = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

navigator.serviceWorker.register(`${PWA_BASE_PATH}sw.js`, { scope: PWA_BASE_PATH });
```

## Development

In development (`npm run dev`), Vite sets `BASE_URL` to `/`.

- `PWA_BASE_PATH` = `/`
- Service worker registered at `/sw.js` with scope `/`

## Production — GitHub Pages

GitHub Pages serves the app under `/sorskoot-pomodoro/`. Pass the base path to
Vite at build time:

```bash
npm run build -- --base=/sorskoot-pomodoro/
```

- `PWA_BASE_PATH` = `/sorskoot-pomodoro/`
- Service worker registered at `/sorskoot-pomodoro/sw.js` with scope `/sorskoot-pomodoro/`

The deploy workflow (`.github/workflows/deploy.yml`) runs this command
automatically on pushes to `main` and uploads `dist/` as the Pages artifact.

## Manual deploy steps

```bash
# 1. Install dependencies
npm ci

# 2. Build with the correct base path
npm run build -- --base=/sorskoot-pomodoro/

# 3. Deploy dist/ to the gh-pages branch or Pages artifact upload
#    (handled automatically by the deploy workflow)
```

## Changing the base path

If you fork this repository and deploy to a different path, change the
`--base=` value to match your Pages URL sub-path. No other source changes are
required — the service worker registration derives its path from `BASE_URL`
automatically.
