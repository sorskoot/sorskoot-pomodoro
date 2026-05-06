export const PWA_BASE_PATH = '/sorskoot-pomodoro/';

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(`${PWA_BASE_PATH}sw.js`, {
        scope: PWA_BASE_PATH,
      })
      .catch((error: unknown) => {
        console.error('Service worker registration failed:', error);
      });
  });
}
