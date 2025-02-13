import type { MemoryStore, WorkingMemory } from "./types";

export function createMemoryStore(): MemoryStore {
  const data = new Map<string, any>();
  return {
    async get(key: string) {
      return data.get(key);
    },
    async clear() {
      data.clear();
    },
    async delete(key: string) {
      data.delete(key);
    },
    async set(key: string, value: any) {
      data.set(key, value);
    },
  };
}
