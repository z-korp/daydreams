import {
  ChromaClient,
  Collection,
  OpenAIEmbeddingFunction,
  type IEmbeddingFunction,
} from "chromadb";
import type { InferContextMemory, VectorStore } from "../types";

export class ChromaVectorStore implements VectorStore {
  private client: ChromaClient;
  private collection!: Collection;
  private embedder: IEmbeddingFunction;

  constructor(
    collectionName: string = "default",
    connection?: string,
    embedder?: IEmbeddingFunction
  ) {
    this.embedder =
      embedder ||
      new OpenAIEmbeddingFunction({
        openai_api_key: process.env.OPENAI_API_KEY!,
        openai_model: "text-embedding-3-small",
      });
    this.client = new ChromaClient({
      path: connection,
    });
    this.initCollection(collectionName);
  }

  private async initCollection(collectionName: string) {
    this.collection = await this.client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: this.embedder,
      metadata: {
        description: "Memory storage for AI consciousness",
      },
    });
  }

  async upsert(
    contextId: string,
    data: InferContextMemory<any>[]
  ): Promise<void> {
    if (data.length === 0) return;

    // Generate IDs for the documents
    const ids = data.map((_, index) => `doc_${Date.now()}_${index}`);

    // Convert documents to strings if they aren't already
    const documents = data.map((item) =>
      typeof item === "string" ? item : JSON.stringify(item)
    );

    await this.collection.add({
      ids,
      documents,
      metadatas: [
        {
          contextId: contextId,
          timestamp: Date.now(),
        },
      ],
    });
  }

  async query(contextId: string, query: string): Promise<any[]> {
    const results = await this.collection.query({
      queryTexts: [query],
      nResults: 5,
      where: {
        contextId: contextId,
      },
    });

    return results.documents[0] || [];
  }

  async createIndex(indexName: string): Promise<void> {
    await this.client.getOrCreateCollection({
      name: indexName,
      embeddingFunction: this.embedder,
    });
  }

  async deleteIndex(indexName: string): Promise<void> {
    await this.collection.delete({
      where: {
        indexName: indexName,
      },
    });
  }
}

export function createChromaVectorStore(
  collectionName: string = "default",
  connection?: string,
  embedder?: IEmbeddingFunction
) {
  return new ChromaVectorStore(collectionName, connection, embedder);
}
