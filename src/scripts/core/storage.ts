export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export function createLocalStorageStore(storage: Storage = localStorage): KeyValueStore {
  return {
    get(key) {
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        storage.setItem(key, value);
      } catch {
        // Private browsing and blocked storage should not break the page.
      }
    },
  };
}
