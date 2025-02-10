import type { MemoryStore, WorkingMemory } from "./types";

export function createContextHandler<T>(
  memoryCreator: (contextId: string) => T
) {
  return (memory: MemoryStore) => async (contextId: string) => {
    const data = await memory.get<T>(contextId);
    return {
      id: contextId,
      memory: data ? data : memoryCreator(contextId),
    };
  };
}

export function defaultContext(): WorkingMemory {
  return {
    inputs: [],
    outputs: [],
    thoughts: [],
    calls: [],
    results: [],
  };
}

export const getOrCreateConversationMemory =
  createContextHandler(defaultContext);

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
