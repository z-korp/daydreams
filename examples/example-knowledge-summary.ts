import { env } from "../packages/core/src/core/env";
import { LLMClient } from "../packages/core/src/core/llm-client";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";
import { LogLevel } from "../packages/core/src/types";
import chalk from "chalk";

interface Collection {
  id: string;
  name: string;
  metadata: {
    description: string;
    [key: string]: any;
  };
  dimension: number | null;
}

async function getCollectionContent(baseUrl: string, collection: Collection) {
  const peekUrl = `${baseUrl}/api/v2/tenants/default_tenant/databases/default_database/collections/${collection.id}/get`;
  console.log(chalk.blue(`\nFetching content for collection ${collection.name}...`));

  const peekResponse = await fetch(peekUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      limit: 1000,
      include: ["metadatas", "documents", "embeddings"]
    })
  });

  if (!peekResponse.ok) {
    const errorText = await peekResponse.text();
    throw new Error(`HTTP error! status: ${peekResponse.status}, body: ${errorText}`);
  }

  const content = await peekResponse.json();
  return { collection, content };
}

async function findLargestCollection(baseUrl: string) {
  console.log(chalk.cyan("\n🔍 Analyzing all collections..."));

  try {
    const collectionsUrl = `${baseUrl}/api/v2/tenants/default_tenant/databases/default_database/collections`;
    const collectionsResponse = await fetch(collectionsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!collectionsResponse.ok) {
      throw new Error(`HTTP error! status: ${collectionsResponse.status}`);
    }
    
    const collections = await collectionsResponse.json();
    
    // Récupérer le contenu de chaque collection
    const collectionSizes = await Promise.all(
      collections.map(async (collection: Collection) => {
        try {
          const { content } = await getCollectionContent(baseUrl, collection);
          const size = content.ids?.length || 0;
          console.log(chalk.gray(`Collection ${collection.name}: ${size} documents`));
          return {
            collection,
            size,
            content
          };
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Could not fetch content for ${collection.name}`));
          return {
            collection,
            size: 0,
            content: null
          };
        }
      })
    );

    // Trier par taille et prendre la plus grande
    const largest = collectionSizes.sort((a, b) => b.size - a.size)[0];
    
    console.log(chalk.green(`\n📊 Largest collection is ${largest.collection.name} with ${largest.size} documents`));
    
    return {
      collection: largest.collection,
      content: largest.content
    };

  } catch (error) {
    console.error(chalk.red("\n❌ Error:"), error);
    throw error;
  }
}

async function analyzeCollectionContent(content: any) {
  console.log(chalk.cyan("\n📊 Analyzing Collection Content"));

  console.log(chalk.gray("Content keys:"), Object.keys(content));

  const { ids, metadatas, documents } = content;
  
  if (!ids || ids.length === 0) {
    console.log(chalk.yellow("No documents found in collection"));
    return;
  }

  console.log(chalk.green(`\nFound ${ids.length} documents`));

  // Analyser les types de métadonnées
  const metadataKeys = new Set<string>();
  metadatas?.forEach((metadata: any) => {
    if (metadata) {
      Object.keys(metadata).forEach(key => metadataKeys.add(key));
    }
  });

  console.log(chalk.yellow("\n📑 Metadata Fields:"));
  console.log(Array.from(metadataKeys).join(", "));

  // Échantillon de documents
  console.log(chalk.yellow("\n📄 Sample Documents:"));
  for (let i = 0; i < Math.min(5, ids.length); i++) {
    console.log(chalk.blue(`\nDocument ${i + 1}:`));
    console.log("ID:", ids[i]);
    console.log("Metadata:", metadatas?.[i] || "No metadata");
    console.log("Content Preview:", documents?.[i]?.substring(0, 200) + "..." || "No content");
  }

  // Statistiques sur les métadonnées
  console.log(chalk.yellow("\n📊 Metadata Statistics:"));
  Array.from(metadataKeys).forEach(key => {
    const valuesSet = new Set(
      metadatas
        ?.filter((m: any) => m && m[key])
        .map((m: any) => m[key]) || []
    );
    console.log(`${key}: ${valuesSet.size} unique values`);
  });

  return {
    documentCount: ids?.length || 0,
    metadataFields: Array.from(metadataKeys),
    sampleDocuments: ids?.slice(0, 5).map((id: string, index: number) => ({
      id,
      metadata: metadatas?.[index] || null,
      contentPreview: documents?.[index]?.substring(0, 200) || null
    })) || []
  };
}

async function main() {
  try {
    const chromaUrl = "http://localhost:8000";

    // Trouver et analyser la plus grande collection
    const { collection, content } = await findLargestCollection(chromaUrl);
    
    // Analyser le contenu
    const analysis = await analyzeCollectionContent(content);

    // Export des résultats
    const fs = require('fs');
    const exportPath = './collection_analysis.json';
    fs.writeFileSync(
      exportPath,
      JSON.stringify({
        collection,
        analysis,
        rawContent: content
      }, null, 2)
    );
    console.log(chalk.green(`\n✅ Analysis exported to ${exportPath}`));

  } catch (error) {
    console.error(chalk.red("\n❌ Error:"), error);
    process.exit(1);
  }
}

// Handle shutdown
process.on("SIGINT", () => {
  console.log(chalk.yellow("\nShutting down analysis..."));
  process.exit(0);
});

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1); 
}); 