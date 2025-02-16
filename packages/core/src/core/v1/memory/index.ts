import type { MemoryStore, VectorStore } from "../types";

export * from "./mongo";
export * from "./base";

export class BaseMemory {
  store: MemoryStore;
  vector: VectorStore;

  constructor(store: MemoryStore, vector: VectorStore) {
    this.store = store;
    this.vector = vector;
  }
}

export function createMemory(store: MemoryStore, vector: VectorStore) {
  return new BaseMemory(store, vector);
}
