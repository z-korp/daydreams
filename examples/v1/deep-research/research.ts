import { render } from "@daydreamsai/core/src/core/v1/utils";
import { createTagParser, formatXml } from "@daydreamsai/core/src/core/v1/xml";
import { TavilyClient } from "@tavily/core";
import { generateText, LanguageModelV1 } from "ai";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import pLimit from 'p-limit';
import { searchResultsPrompt } from "./prompts";

export type Research = {
  id: string;
  name: string;
  queries: {
    query: string;
    goal: string;
  }[];
  questions: string[];
  learnings: string[];
  status: "in_progress" | "done";
};

const thinkParser = createTagParser("think");
const outputParser = createTagParser("output", (t) =>
  searchResultsSchema.parse(JSON.parse(t))
);

const searchResultsSchema = z.object({
  learnings: z
    .array(
      z.object({
        content: z.string().describe("learning content"),
        references: z.array(z.string()).describe("url references"),
      })
    )
    .describe(`List of learnings, max of 5`),

  followUpQueries: z.array(
    z.object({
      query: z
        .string()
        .describe(
          "List of follow-up SERP queries to research the topic further, max of 2"
        ),
      goal: z
        .string()
        .describe(
          "The goal of the research that this query is meant to accomplish"
        ),
      // nextSteps: z.array(z.string()),
    })
  ),
});

export const researchSchema = z.object({
  id: z.string().describe("id of the research use memorable ids"),
  name: z.string().describe("The research name/topic"),
  prompt: z.string().describe("the user prompt"),
  queries: z.array(
    z.object({
      query: z.string().describe("The SERP query"),
      goal: z
        .string()
        .describe(
          "The goal of the research that this query is meant to accomplish"
        ),
    })
  ),
  questions: z
    .array(z.string())
    .describe(
      `Follow up questions to clarify the research direction, max of 5`
    ),
});

export type ResearchProgress = {
  currentDepth: number;
  totalDepth: number;
  currentQuery?: string;
  totalQueries: number;
  completedQueries: number;
};

const ConcurrencyLimit = 2;
const limit = pLimit(ConcurrencyLimit);

export async function startDeepResearch({
  model,
  research,
  tavilyClient,
  maxDepth,
  onProgress,
}: {
  model: LanguageModelV1;
  research: Research;
  tavilyClient: TavilyClient;
  maxDepth: number;
  onProgress?: (progress: ResearchProgress) => void;
}) {
  console.log("=======STARTING-DEEP-RESEARCH=======");

  let queries = research.queries.slice();
  let depth = 1;

  const progress: ResearchProgress = {
    currentDepth: depth,
    totalDepth: maxDepth,
    totalQueries: queries.length,
    completedQueries: 0
  };

  const reportProgress = (update: Partial<ResearchProgress>) => {
    Object.assign(progress, update);
    onProgress?.(progress);
  };

  while (queries.length > 0) {
    const _queries = queries.slice();
    queries = [];

    await Promise.all(
      _queries.map((query) =>
        limit(async () => {
          console.log("Executing query:", query);
          reportProgress({
            currentQuery: query.query,
            currentDepth: depth
          });

          try {
            const { results } = await tavilyClient.search(query.query, {
              maxResults: 5,
              searchDepth: "advanced",
            });

            const res = await generateText({
              model: model,
              abortSignal: AbortSignal.timeout(60_000),
              system: render(searchResultsPrompt, {
                research: formatXml({
                  tag: "research",
                  params: { id: research.id },
                  content: JSON.stringify(research),
                }),
                goal: query.goal,
                query: query.query,
                results: results.map((r) =>
                  formatXml({
                    tag: "result",
                    params: { url: r.url },
                    content: r.content,
                  })
                ),
                schema: JSON.stringify(zodToJsonSchema(searchResultsSchema)),
              }),
              messages: [
                {
                  role: "assistant",
                  content: "<think>",
                },
              ],
            });

            const text = "<think>" + res.text;

            try {
              const [think] = thinkParser(text);
              const [output] = outputParser(text);

              if (output) {
                console.log(output);

                research.learnings.push(
                  ...output.content.learnings.map((l) => l.content)
                );

                if (depth < maxDepth) {
                  queries.push(...output.content.followUpQueries);
                }
              } else {
                console.log(text);
              }
            } catch (error) {
              console.log("failed parsing");
            }

            reportProgress({
              completedQueries: progress.completedQueries + 1
            });

          } catch (error) {
            console.error("Error processing query:", query.query, error);
            reportProgress({
              completedQueries: progress.completedQueries + 1
            });
          }
        })
      )
    );

    depth++;
    research.queries.push(...queries);

    reportProgress({
      totalQueries: progress.totalQueries + queries.length
    });
  }

  console.log(research);

  const res = await generateText({
    model,
    system: render(
      `
Given the following research, write a final report on the topic using the learnings from research. 
Make it as as detailed as possible, aim for 3 or more pages, include ALL the learnings from research:
Here is all the data from research:
<research>{{research}}</research>

Return your report in markdown format. Always send the full report, do not cut it off.
`,
      {
        research: JSON.stringify(research),
      }
    ),
    messages: [
      {
        role: "assistant",
        content: "<think>",
      },
    ],
  });

  console.log("====FINAL REPORT=====");
  console.log("<think>" + res.text);

  const report = res.text.slice(res.text.lastIndexOf("</think>"));

  console.log({ report });
  return report;
}
