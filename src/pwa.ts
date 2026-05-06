export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const basePath = '/sorskoot-pomodoro/';

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${basePath}sw.js`, {
      scope: basePath,
    });
  });
}
