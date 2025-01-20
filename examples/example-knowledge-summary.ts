import { env } from "../packages/core/src/core/env";
import { LLMClient } from "../packages/core/src/core/llm-client";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";
import { LogLevel } from "../packages/core/src/types";
import chalk from "chalk";

interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  lastUpdated: Date;
  source?: string;
  relatedIds?: string[];
}

interface KnowledgeSummary {
  categories: {
    [key: string]: {
      documentCount: number;
      keyTopics: string[];
      recentUpdates: string[];
    };
  };
  topTags: { tag: string; count: number }[];
  recentActivity: {
    title: string;
    category: string;
    timestamp: Date;
  }[];
}

async function exploreChromaDB(baseUrl: string) {
  console.log(chalk.cyan("\n🔍 Starting ChromaDB Exploration..."));

  try {
    // 1. Liste des tenants
    console.log(chalk.blue("\n📊 Fetching tenants..."));
    const tenantsResponse = await fetch(`${baseUrl}/api/v2/tenants`);
    const tenants = await tenantsResponse.json();
    console.log(chalk.green("✓ Tenants:"), JSON.stringify(tenants, null, 2));

    // 2. Liste des databases
    const tenant = "default_tenant";
    console.log(chalk.blue(`\n📚 Fetching databases for tenant: ${tenant}`));
    const databasesResponse = await fetch(`${baseUrl}/api/v2/tenants/${tenant}/databases`);
    const databases = await databasesResponse.json();
    console.log(chalk.green("✓ Databases:"), JSON.stringify(databases, null, 2));

    // 3. Liste des collections
    const database = "default_database";
    console.log(chalk.blue(`\n📁 Fetching collections...`));
    const collectionsResponse = await fetch(`${baseUrl}/api/v2/tenants/${tenant}/databases/${database}/collections`);
    const collections = await collectionsResponse.json();
    console.log(chalk.green("✓ Collections:"), JSON.stringify(collections, null, 2));

    return collections;
  } catch (error) {
    console.error(chalk.red("\n❌ Error exploring ChromaDB:"), error);
    throw error;
  }
}

async function main() {
  try {
    const chromaUrl = "http://localhost:8000";

    // Debug: Explorer ChromaDB avant de commencer
    console.log(chalk.cyan("\n🔍 Starting ChromaDB Debug..."));
    const collections = await exploreChromaDB(chromaUrl);
    
    // Initialize Vector DB
    const vectorDb = new ChromaVectorDB("knowledge_base", {
      chromaUrl,
      logLevel: LogLevel.DEBUG,
    });

    // Initialize LLM client
    const llmClient = new LLMClient({
      provider: "anthropic",
      apiKey: env.ANTHROPIC_API_KEY,
    });

    console.log(chalk.cyan("\n🤖 Starting Knowledge Base Analysis..."));

    // Debug: Afficher les collections disponibles
    console.log(chalk.yellow("\n📚 Available Collections:"));
    if (collections?.collections?.length > 0) {
      for (const collection of collections.collections) {
        console.log(chalk.blue(`\n Collection: ${collection.name}`));
        console.log(` ID: ${collection.id}`);
        
        // Peek dans la collection
        const peekUrl = `${chromaUrl}/api/v2/tenants/default_tenant/databases/default_database/collections/${collection.id}/get`;
        const peekResponse = await fetch(peekUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 5, include: ["metadatas", "documents"] })
        });
        const peekResults = await peekResponse.json();
        
        console.log(chalk.green(` Documents: ${peekResults.ids?.length || 0}`));
        if (peekResults.ids?.length > 0) {
          console.log(chalk.cyan("\n Sample Documents:"));
          for (let i = 0; i < Math.min(2, peekResults.ids.length); i++) {
            console.log(chalk.yellow(`\n Document ${i + 1}:`));
            console.log(` ID: ${peekResults.ids[i]}`);
            console.log(` Metadata:`, peekResults.metadatas[i]);
            console.log(` Content (preview):`, 
              peekResults.documents[i]?.substring(0, 100) + '...');
          }
        }
      }
    }

    // Fetch initial documents
    console.log(chalk.cyan("\n📥 Fetching documents from collection..."));
    const collection = await vectorDb.getCollection();
    const results = await collection.peek({ limit: 20 });
    
    console.log(chalk.blue(`\n📚 Found ${results.ids.length} documents in the knowledge base`));

    // Debug: Afficher les métadonnées brutes
    console.log(chalk.yellow("\n🔍 Raw Metadata Sample:"));
    for (let i = 0; i < Math.min(3, results.ids.length); i++) {
      console.log(chalk.blue(`\nDocument ${i + 1}:`));
      console.log(`ID: ${results.ids[i]}`);
      console.log(`Metadata:`, results.metadatas[i]);
      console.log(`Content Preview: ${results.documents[i]?.substring(0, 100)}...`);
    }

    // Initialize summary structure
    const summary: KnowledgeSummary = {
      categories: {},
      topTags: [],
      recentActivity: [],
    };

    // Process documents
    const tagCount: { [key: string]: number } = {};
    console.log(chalk.cyan("\n📊 Processing documents..."));

    for (let i = 0; i < results.ids.length; i++) {
      try {
        const metadata = results.metadatas[i];
        if (!metadata) {
          console.log(chalk.yellow(`Skipping document ${i}: No metadata`));
          continue;
        }

        // Debug: Log document processing
        console.log(chalk.blue(`\nProcessing document ${i + 1}/${results.ids.length}:`));
        console.log(`ID: ${results.ids[i]}`);
        console.log(`Raw Metadata:`, metadata);

        const document = {
          id: results.ids[i],
          title: metadata.title as string || "Untitled",
          category: metadata.category as string || "Uncategorized",
          content: results.documents[i] || "",
          tags: ((metadata.tags as string) || "").split(",").filter(Boolean),
          lastUpdated: new Date(metadata.lastUpdated as string || Date.now()),
          source: metadata.source as string,
          relatedIds: ((metadata.relatedIds as string) || "").split(",").filter(Boolean)
        };

        console.log(chalk.green("Processed Document:"), {
          title: document.title,
          category: document.category,
          tags: document.tags,
          lastUpdated: document.lastUpdated
        });

        // Process categories
        if (!summary.categories[document.category]) {
          summary.categories[document.category] = {
            documentCount: 0,
            keyTopics: [],
            recentUpdates: [],
          };
        }

        summary.categories[document.category].documentCount++;
        summary.categories[document.category].recentUpdates.push(document.title);

        // Process tags
        document.tags.forEach(tag => {
          if (tag.trim()) {
            tagCount[tag.trim()] = (tagCount[tag.trim()] || 0) + 1;
          }
        });

        // Add to recent activity
        summary.recentActivity.push({
          title: document.title,
          category: document.category,
          timestamp: document.lastUpdated,
        });
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Could not process document: ${error}`));
        continue;
      }
    }

    // Sort and limit recent activity
    summary.recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    summary.recentActivity = summary.recentActivity.slice(0, 10);

    // Process top tags
    summary.topTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Debug: Log processed summary
    console.log(chalk.yellow("\n📊 Processed Summary:"));
    console.log(JSON.stringify(summary, null, 2));

    // Get recent episodes
    console.log(chalk.cyan("\n📜 Fetching recent episodes..."));
    const recentEpisodes = await vectorDb.getRecentEpisodes(5);
    console.log(chalk.green("Recent Episodes:"), recentEpisodes);

    // Get similar documents for each top tag
    console.log(chalk.cyan("\n🔍 Finding similar documents..."));
    const similarDocuments = [];
    for (const { tag } of summary.topTags.slice(0, 3)) {
      try {
        console.log(chalk.blue(`Searching for documents with tag: ${tag}`));
        const docs = await vectorDb.findSimilarDocuments(tag, 3);
        console.log(chalk.green(`Found ${docs.length} documents for tag ${tag}`));
        similarDocuments.push(...docs);
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Could not fetch documents for tag ${tag}: ${error}`));
      }
    }

    // Generate insights using LLM
    const insightPrompt = `
      Analyze this knowledge base summary and provide key insights:
      
      Knowledge Base Summary:
      ${JSON.stringify(summary, null, 2)}
      
      Recent Episodes:
      ${JSON.stringify(recentEpisodes, null, 2)}
      
      Related Documents:
      ${JSON.stringify(similarDocuments, null, 2)}
      
      Please focus on:
      1. Patterns in the knowledge distribution
      2. Most active categories
      3. Emerging topics based on tags
      4. Recent activity trends
      5. Connections between episodes and documents
      
      Format your response in markdown with clear sections.
    `;

    console.log(chalk.cyan("\n🤖 Generating AI insights..."));
    const insights = await llmClient.complete(insightPrompt);

    // Print final summary
    console.log(chalk.green("\n📊 Final Knowledge Base Summary:"));
    
    // Categories
    console.log(chalk.yellow("\n📁 Categories:"));
    Object.entries(summary.categories).forEach(([category, data]) => {
      console.log(chalk.blue(`\n${category}:`));
      console.log(`   Documents: ${data.documentCount}`);
      console.log(`   Recent Updates: ${data.recentUpdates.slice(0, 3).join(", ")}`);
    });

    // Top Tags
    console.log(chalk.yellow("\n🏷️  Top Tags:"));
    summary.topTags.forEach(({ tag, count }) => {
      console.log(`   ${tag}: ${count} occurrences`);
    });

    // Recent Activity
    console.log(chalk.yellow("\n⚡ Recent Activity:"));
    summary.recentActivity.forEach(({ title, category, timestamp }) => {
      console.log(`   ${timestamp.toLocaleDateString()} - ${title} (${category})`);
    });

    // Recent Episodes
    console.log(chalk.yellow("\n🔄 Recent Episodes:"));
    recentEpisodes.forEach(episode => {
      console.log(`\n   Action: ${episode.action}`);
      console.log(`   Outcome: ${episode.outcome}`);
      console.log(`   Date: ${episode.timestamp.toLocaleDateString()}`);
      if (episode.emotions?.length) {
        console.log(`   Emotions: ${episode.emotions.join(", ")}`);
      }
    });

    // AI Insights
    console.log(chalk.yellow("\n🤖 AI Insights:"));
    console.log(insights);

    // Export summary to file
    const fs = require('fs');
    const exportPath = './knowledge_summary.json';
    fs.writeFileSync(
      exportPath,
      JSON.stringify({
        summary,
        recentEpisodes,
        similarDocuments,
        insights,
        debug: {
          collections,
          rawResults: results,
        }
      }, null, 2)
    );
    console.log(chalk.green(`\n✅ Summary exported to ${exportPath}`));

  } catch (error) {
    console.error(chalk.red("\n❌ Error analyzing knowledge base:"), error);
    process.exit(1);
  }
}

// Handle shutdown
process.on("SIGINT", () => {
  console.log(chalk.yellow("\nShutting down knowledge base analyzer..."));
  process.exit(0);
});

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
}); 