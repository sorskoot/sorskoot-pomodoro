import { StorageService } from './StorageService';
import type { VMock } from '../test/test-utils';

describe('StorageService', () => {
  let service: StorageService;
  let stub: Storage;

  beforeEach(() => {
    stub = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    } as unknown as Storage;

    service = new StorageService(stub);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Group 1: get()
  // ---------------------------------------------------------------------------
  describe('get()', () => {
    it('returns null when the key does not exist', () => {
      (stub.getItem as unknown as VMock).mockReturnValue(null);
      expect(service.get('missing-key')).toBeNull();
    });

    it('returns the parsed value for a stored key', () => {
      (stub.getItem as unknown as VMock).mockReturnValue(JSON.stringify({ x: 42 }));
      expect(service.get<{ x: number }>('my-key')).toEqual({ x: 42 });
    });

    it('returns null and logs console.error when the stored value is invalid JSON', () => {
      (stub.getItem as unknown as VMock).mockReturnValue('not-json');

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = service.get('bad-json-key');

      expect(result).toBeNull();
      expect(errorSpy).toHaveBeenCalledOnce();
      expect(errorSpy.mock.calls[0][0]).toContain('StorageService.get');
      expect(errorSpy.mock.calls[0][0]).toContain('bad-json-key');
    });

    it('returns null and logs console.error when storage.getItem throws', () => {
      (stub.getItem as unknown as VMock).mockImplementation(() => { throw new Error('getItem unavailable'); });
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = service.get('any-key');

      expect(result).toBeNull();
      expect(errorSpy).toHaveBeenCalledOnce();
      expect(errorSpy.mock.calls[0][0]).toContain('StorageService.get');
      expect(errorSpy.mock.calls[0][0]).toContain('any-key');
    });
  });

  // ---------------------------------------------------------------------------
  // Group 2: set()
  // ---------------------------------------------------------------------------
  describe('set()', () => {
    it('stores the serialised value (round-trip: set then get returns the same value)', () => {
      const store: Record<string, string> = {};
      (stub.setItem as unknown as VMock).mockImplementation((k: string, v: string) => { store[k] = v; });
      (stub.getItem as unknown as VMock).mockImplementation((k: string) => store[k] ?? null);

      const payload = { name: 'Pomodoro', count: 5 };
      service.set('rt-key', payload);
      expect(service.get<typeof payload>('rt-key')).toEqual(payload);
    });

    it('does not throw and logs console.error when JSON.stringify fails on a circular reference', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Build a circular-reference object — JSON.stringify will throw TypeError
      const circular: any = {};
      circular.self = circular;

      expect(() => service.set('circular-key', circular)).not.toThrow();
      expect(errorSpy).toHaveBeenCalledOnce();
      expect(errorSpy.mock.calls[0][0]).toContain('StorageService.set');
      expect(errorSpy.mock.calls[0][0]).toContain('circular-key');
    });

    it('does not throw and logs console.error when storage.setItem throws a QuotaExceededError', () => {
      (stub.setItem as unknown as VMock).mockImplementation(() => { throw new DOMException('QuotaExceededError', 'QuotaExceededError'); });
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => service.set('quota-key', { data: 'value' })).not.toThrow();
      expect(errorSpy).toHaveBeenCalledOnce();
      expect(errorSpy.mock.calls[0][0]).toContain('StorageService.set');
      expect(errorSpy.mock.calls[0][0]).toContain('quota-key');
    });
  });

  // ---------------------------------------------------------------------------
  // Group 3: remove()
  // ---------------------------------------------------------------------------
  describe('remove()', () => {
    it('removes an existing key so that get() returns null afterwards', () => {
      const store: Record<string, string> = { 'remove-me': JSON.stringify('some value') };
      (stub.getItem as unknown as VMock).mockImplementation((k: string) => store[k] ?? null);
      (stub.removeItem as unknown as VMock).mockImplementation((k: string) => { delete store[k]; });

      service.remove('remove-me');

      expect(service.get('remove-me')).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Group 4: clear()
  // ---------------------------------------------------------------------------
  describe('clear()', () => {
    it('clears all keys so that every stored key returns null afterwards', () => {
      const store: Record<string, string> = {};
      (stub.getItem as unknown as VMock).mockImplementation((k: string) => store[k] ?? null);
      (stub.setItem as unknown as VMock).mockImplementation((k: string, v: string) => { store[k] = v; });
      (stub.clear as unknown as VMock).mockImplementation(() => { for (const k in store) delete store[k]; });

      service.set('alpha', 1);
      service.set('beta', 2);
      expect(service.get('alpha')).toBe(1);
      expect(service.get('beta')).toBe(2);

      service.clear();

      expect(service.get('alpha')).toBeNull();
      expect(service.get('beta')).toBeNull();
    });
  });
});
