import { StorageService } from './StorageService';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    service = new StorageService();
  });

  describe('get', () => {
    it('returns null for a missing key', () => {
      expect(service.get('no-such-key')).toBeNull();
    });

    it('returns the parsed value for an existing key', () => {
      localStorage.setItem('my-key', JSON.stringify({ x: 42 }));
      expect(service.get<{ x: number }>('my-key')).toEqual({ x: 42 });
    });

    it('returns null when the stored value is malformed JSON', () => {
      localStorage.setItem('bad-key', '{not valid json');
      expect(service.get('bad-key')).toBeNull();
    });
  });

  describe('set', () => {
    it('stores the value as a JSON string', () => {
      service.set('num-key', 99);
      expect(localStorage.getItem('num-key')).toBe('99');
    });

    it('stores objects as JSON', () => {
      service.set('obj-key', { a: 1, b: 'hello' });
      expect(localStorage.getItem('obj-key')).toBe(JSON.stringify({ a: 1, b: 'hello' }));
    });
  });

  describe('remove', () => {
    it('removes the specified key', () => {
      localStorage.setItem('to-remove', '"value"');
      service.remove('to-remove');
      expect(localStorage.getItem('to-remove')).toBeNull();
    });

    it('does not throw when removing a non-existent key', () => {
      expect(() => service.remove('ghost-key')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('removes all keys from localStorage', () => {
      localStorage.setItem('k1', '"v1"');
      localStorage.setItem('k2', '"v2"');
      service.clear();
      expect(localStorage.length).toBe(0);
    });
  });
});
