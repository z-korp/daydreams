import { type LanguageModelV1 } from "ai";
import { z } from "zod";
import { expert } from "../utils";
import { action } from "../utils";
import FirecrawlApp, { type SearchResponse } from '@mendable/firecrawl-js';
import pLimit from 'p-limit';
import { compact } from 'lodash-es';
import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY!,
});

// Initialize Firecrawl
const firecrawl = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_KEY ?? '',
    apiUrl: process.env.FIRECRAWL_BASE_URL,
});

const model = groq("llama-3.1-70b-versatile");

const ConcurrencyLimit = 2;

function trimPrompt(content: string, maxLength: number = 25_000): string {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength);
}

// First, let's define a proper type for the SearchResponse result
const SearchResultSchema = z.object({
    data: z.array(z.object({
        markdown: z.string().optional(),
        url: z.string().optional()
    }))
});

// Actions for the expert
export const generateSerpQueriesAction = action({
    name: "generate_serp_queries",
    description: "Generate SERP queries based on a research query",
    params: z.object({
        query: z.string(),
        numQueries: z.number().optional().default(3),
        learnings: z.array(z.string()).optional()
    }),
    async handler({ query, numQueries, learnings }) {
        const res = await generateObject({
            model,
            system: `You are a research expert tasked with generating search queries to explore a topic thoroughly.`,
            prompt: `Given the following prompt, generate a list of SERP queries to research the topic. Return a maximum of ${numQueries} queries, but feel free to return less if the original prompt is clear. Make sure each query is unique and not similar to each other: <prompt>${query}</prompt>\n\n${learnings
                ? `Here are some learnings from previous research, use them to generate more specific queries: ${learnings.join(
                    '\n',
                )}`
                : ''
                }`,
            schema: z.object({
                queries: z
                    .array(
                        z.object({
                            query: z.string().describe('The SERP query'),
                            researchGoal: z
                                .string()
                                .describe(
                                    'First talk about the goal of the research that this query is meant to accomplish, then go deeper into how to advance the research once the results are found, mention additional research directions. Be as specific as possible, especially for additional research directions.',
                                ),
                        }),
                    )
                    .describe(`List of SERP queries, max of ${numQueries}`),
            }),
        });

        return res.object.queries;
    }
});

export const processSerpResultAction = action({
    name: "process_serp_result",
    description: "Process SERP results to extract learnings",
    params: z.object({
        query: z.string(),
        result: SearchResultSchema, // Use the proper schema
        numLearnings: z.number().optional().default(3),
        numFollowUpQuestions: z.number().optional().default(3)
    }),
    async handler({ query, result, numLearnings, numFollowUpQuestions }) {
        // Safely handle potentially missing data
        const contents = compact(
            result.data
                .filter(item => item.markdown) // Only process items with markdown
                .map(item => item.markdown)
        ).map(content => trimPrompt(content!, 25_000));

        if (contents.length === 0) {
            return {
                learnings: [],
                followUpQuestions: []
            };
        }

        const res = await generateObject({
            model,
            system: `You are a research expert tasked with extracting key learnings from search results.`,
            prompt: `Given the following contents from a SERP search for the query <query>${query}</query>, generate a list of learnings from the contents. Return a maximum of ${numLearnings} learnings, but feel free to return less if the contents are clear. Make sure each learning is unique and not similar to each other. The learnings should be concise and to the point, as detailed and information dense as possible. Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any exact metrics, numbers, or dates.\n\n<contents>${contents
                .map(content => `<content>\n${content}\n</content>`)
                .join('\n')}</contents>`,
            schema: z.object({
                learnings: z
                    .array(z.string())
                    .describe(`List of learnings, max of ${numLearnings}`),
                followUpQuestions: z
                    .array(z.string())
                    .describe(
                        `List of follow-up questions to research the topic further, max of ${numFollowUpQuestions}`,
                    ),
            }),
        });

        return res.object;
    }
});

export const writeFinalReportAction = action({
    name: "write_final_report",
    description: "Write a final report based on research findings",
    params: z.object({
        prompt: z.string(),
        learnings: z.array(z.string()),
        visitedUrls: z.array(z.string())
    }),
    async handler({ prompt, learnings, visitedUrls }) {
        const learningsString = trimPrompt(
            learnings
                .map(learning => `<learning>\n${learning}\n</learning>`)
                .join('\n'),
            150_000,
        );

        const res = await generateObject({
            model,
            system: `You are a research expert tasked with writing comprehensive research reports.`,
            prompt: `Given the following prompt from the user, write a final report on the topic using the learnings from research. Make it as detailed as possible, aim for 3 or more pages, include ALL the learnings from research:\n\n<prompt>${prompt}</prompt>\n\nHere are all the learnings from previous research:\n\n<learnings>\n${learningsString}\n</learnings>`,
            schema: z.object({
                reportMarkdown: z
                    .string()
                    .describe('Final report on the topic in Markdown'),
            }),
        });

        // Append the visited URLs section to the report
        const urlsSection = `\n\n## Sources\n\n${visitedUrls.map(url => `- ${url}`).join('\n')}`;
        return {
            report: res.object.reportMarkdown + urlsSection,
            sources: visitedUrls
        };
    }
});

// Helper function to conduct deep research
async function conductDeepResearch({
    query,
    breadth,
    depth,
    learnings = [],
    visitedUrls = [],
    model
}: {
    query: string;
    breadth: number;
    depth: number;
    learnings?: string[];
    visitedUrls?: string[];
    model: LanguageModelV1;
}): Promise<{ learnings: string[]; visitedUrls: string[] }> {
    const serpQueries = await generateSerpQueriesAction.handler(
        { query, numQueries: breadth, learnings },
        { model }
    );

    const limit = pLimit(ConcurrencyLimit);

    const results = await Promise.all(
        serpQueries.map(serpQuery =>
            limit(async () => {
                try {
                    const result = await firecrawl.search(serpQuery.query, {
                        timeout: 15000,
                        limit: 5,
                        scrapeOptions: { formats: ['markdown'] },
                    });

                    const newUrls = compact(result.data.map(item => item.url));
                    const newBreadth = Math.ceil(breadth / 2);
                    const newDepth = depth - 1;

                    const processedResults = await processSerpResultAction.handler(
                        {
                            query: serpQuery.query,
                            result,
                            numLearnings: 3,
                            numFollowUpQuestions: newBreadth
                        },
                        { model }
                    );

                    const allLearnings = [...learnings, ...processedResults.learnings];
                    const allUrls = [...visitedUrls, ...newUrls];

                    if (newDepth > 0) {
                        const nextQuery = `
                            Previous research goal: ${serpQuery.researchGoal}
                            Follow-up research directions: ${processedResults.followUpQuestions.map(q => `\n${q}`).join('')}
                        `.trim();

                        return conductDeepResearch({
                            query: nextQuery,
                            breadth: newBreadth,
                            depth: newDepth,
                            learnings: allLearnings,
                            visitedUrls: allUrls,
                            model
                        });
                    }

                    return {
                        learnings: allLearnings,
                        visitedUrls: allUrls,
                    };
                } catch (e: any) {
                    console.error(`Error processing query ${serpQuery.query}:`, e);
                    return {
                        learnings: [],
                        visitedUrls: [],
                    };
                }
            })
        )
    );

    return {
        learnings: [...new Set(results.flatMap(r => r.learnings))],
        visitedUrls: [...new Set(results.flatMap(r => r.visitedUrls))]
    };
}

export const deepResearchExpert = expert({
    description: "Expert in conducting deep research on topics",
    instructions: `
    You are an expert at conducting deep research on topics. Your process:
    1. Generate SERP queries based on the research topic
    2. Process search results to extract key learnings
    3. Generate follow-up questions for deeper research
    4. Write comprehensive final reports
    `,
    actions: [
        generateSerpQueriesAction,
        processSerpResultAction,
        writeFinalReportAction
    ]
}); 