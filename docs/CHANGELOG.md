# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed

- `useTimer`: `advanceMode` passed a stale (undefined) `tick` closure to
  `timerService.start` on auto-start. Fixed by routing through `tickRef` so the
  live `tick` function is always used at call time.
- `StorageService.get`: errors were silently swallowed; they are now logged via
  `console.error` with the offending key for easier debugging.

### Changed

- `StorageService.set`: now wrapped in `try/catch`. `JSON.stringify` errors
  (circular references) and `localStorage` quota/security errors are caught and
  logged instead of crashing the caller.
- `src/pwa.ts`: `PWA_BASE_PATH` is now derived from `import.meta.env.BASE_URL`
  (with trailing-slash normalization) instead of being hard-coded. Build with
  `--base=/sorskoot-pomodoro/` for GitHub Pages; the dev server uses `/` automatically.

### Added

- `.github/workflows/ci.yml`: CI pipeline on Node 22. Runs on every push and
  pull request: `npm ci` → `npm run build` → `npm test`.
- `src/hooks/useTimer.test.ts`: regression tests for the auto-start closure fix.
- `src/hooks/useTimer.behavior.test.ts`: behavioral tests for auto-start, skip,
  advance, sound, callback, and settings-change scenarios.
- `src/services/StorageService.test.ts`: tests for get/set error paths including
  invalid JSON, circular references, and quota errors.
- `docs/PWA.md`: deployment documentation for service worker base path configuration.
