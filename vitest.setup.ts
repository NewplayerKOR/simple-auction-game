import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

if (typeof window !== 'undefined') {
  // Node 26 exposes an unavailable experimental localStorage global, which
  // prevents Vitest's jsdom environment from installing jsdom's storage.
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  if (typeof document !== 'undefined') {
    cleanup();
  }
});
