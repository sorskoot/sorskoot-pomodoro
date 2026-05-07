import type { IStorageService } from './interfaces/IStorageService';

export class StorageService implements IStorageService {
  constructor(private readonly storage: Storage = localStorage) {}

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

export const storageService = new StorageService();
