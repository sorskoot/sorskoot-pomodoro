import { PWA_BASE_PATH, registerServiceWorker } from './pwa';

describe('registerServiceWorker', () => {
  const originalServiceWorkerDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'serviceWorker',
  );

  afterEach(() => {
    if (originalServiceWorkerDescriptor) {
      Object.defineProperty(
        navigator,
        'serviceWorker',
        originalServiceWorkerDescriptor,
      );
    } else {
      delete (navigator as { serviceWorker?: unknown }).serviceWorker;
    }
    vi.restoreAllMocks();
  });

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

  it('does nothing when service workers are not supported', () => {
    delete (navigator as { serviceWorker?: unknown }).serviceWorker;
    const addEventListener = vi.spyOn(window, 'addEventListener');

    registerServiceWorker();

    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('logs a registration error when registration fails', async () => {
    const error = new Error('registration failed');
    const register = vi.fn().mockRejectedValue(error);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    });

    registerServiceWorker();
    window.dispatchEvent(new Event('load'));
    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Service worker registration failed:',
        error,
      );
    });
  });
});
