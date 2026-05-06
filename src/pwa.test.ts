import { PWA_BASE_PATH, registerServiceWorker } from './pwa';

describe('registerServiceWorker', () => {
  it('registers the service worker on window load', () => {
    const register = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    });

    registerServiceWorker();
    window.dispatchEvent(new Event('load'));

    expect(register).toHaveBeenCalledWith(`${PWA_BASE_PATH}sw.js`, {
      scope: PWA_BASE_PATH,
    });
  });
});
