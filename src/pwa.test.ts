import { registerServiceWorker } from './pwa';

describe('registerServiceWorker', () => {
  it('registers the service worker on window load', () => {
    const basePath = '/sorskoot-pomodoro/';
    const register = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    });

    registerServiceWorker();
    window.dispatchEvent(new Event('load'));

    expect(register).toHaveBeenCalledWith(`${basePath}sw.js`, {
      scope: basePath,
    });
  });
});
