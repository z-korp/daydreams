import { ChromaClient, Collection } from "chromadb";
import type { VectorStore } from "../types";

export class ChromaVectorStore implements VectorStore {
  private client: ChromaClient;
  private collection!: Collection;

  constructor(collectionName: string = "default") {
    this.client = new ChromaClient();
    this.initCollection(collectionName);
  }

  private async initCollection(collectionName: string) {
    this.collection = await this.client.createCollection({
      name: collectionName,
    });
  }

  async add(data: any[]): Promise<void> {
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
    });
  }

  async search(query: string): Promise<any[]> {
    const results = await this.collection.query({
      queryTexts: [query],
      nResults: 5,
    });

    return results.documents[0] || [];
  }
}
