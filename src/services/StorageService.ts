import type { IStorageService } from './interfaces/IStorageService';

export class StorageService implements IStorageService {
  // Do NOT access globalThis.localStorage at module load time — in some
  // embedding environments (private browsing, iframes with restrictive
  // policies) accessing localStorage can throw. Consumers should obtain an
  // instance via getStorageService() which constructs lazily inside try/catch.
  constructor(private readonly storage: Storage) {}

  get<T>(key: string): T | null {
    try {
      const raw = this.storage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      console.error(`StorageService.get: failed to read key "${key}"`, err);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // JSON.stringify throws on circular references; setItem throws
      // DOMException (QuotaExceededError, SecurityError in private browsing).
      console.error(`StorageService.set: failed to write key "${key}"`, err);
    }
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

// Lazy singleton getter. Use globalThis.localStorage when available; otherwise
// fall back to a simple in-memory Storage implementation so code can run in
// non-browser or restricted environments (tests, Node REPLs without localStorage).
let _instance: StorageService | null = null;

function createInMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    length: 0,
    clear() {
      map.clear();
      (this as any).length = 0;
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key) as string : null;
    },
    key(_index: number) {
      // Not used in the app — return null for simplicity.
      return null;
    },
    removeItem(key: string) {
      map.delete(key);
      (this as any).length = map.size;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
      (this as any).length = map.size;
    },
  } as unknown as Storage;
}

export function getStorageService(): StorageService {
  if (_instance) return _instance;

  try {
    const ls = (globalThis as any).localStorage as Storage | undefined;
    if (ls) {
      _instance = new StorageService(ls);
    } else {
      _instance = new StorageService(createInMemoryStorage());
    }
  } catch (err) {
    // Accessing localStorage can throw in some environments (privacy/iframe
    // restrictions). Fall back to in-memory storage so the app remains usable.
    console.error('getStorageService: failed to access localStorage, using in-memory fallback', err);
    _instance = new StorageService(createInMemoryStorage());
  }

  return _instance;
}
