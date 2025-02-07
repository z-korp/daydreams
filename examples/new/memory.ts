import { MemoryStore, WorkingMemory } from "./types";

export async function getOrCreateConversationMemory(
    memory: MemoryStore,
    conversationId: string
) {
    const data = await memory.get<WorkingMemory>(conversationId);
    if (data) return data;
    return {
        inputs: [],
        outputs: [],
        thoughts: [],
        calls: [],
        chains: [],
    };
}

export function createMemoryStore(): MemoryStore {
    const data = new Map<string, any>();
    return {
        async get(key) {
            return data.get(key);
        },
        async clear() {
            data.clear();
        },
        async delete(key) {
            data.delete(key);
        },
        async set(key, value) {
            data.set(key, value);
        },
    };
}
