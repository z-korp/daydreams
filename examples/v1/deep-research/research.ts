import { tavily, TavilyClient } from "@tavily/core";
import { generateText, LanguageModelV1 } from "ai";
import pLimit from "p-limit";
import {
  finalReportPrompt,
  searchResultsParser,
  searchResultsPrompt,
} from "./prompts";
import { researchSchema, searchResultsSchema } from "./schemas";
import { action, Debugger } from "@daydreamsai/core/src/core/v1";

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

export type ResearchProgress = {
  currentDepth: number;
  totalDepth: number;
  currentQuery?: string;
  totalQueries: number;
  completedQueries: number;
};

const ConcurrencyLimit = 1;
const limit = pLimit(ConcurrencyLimit);

async function retry<T>(
  key: string,
  fn: () => Promise<T>,
  retries: number = 3
) {
  console.log("trying", { key });
  while (retries > 0) {
    try {
      return await fn();
    } catch (error) {
      retries--;
      if (retries === 0) {
        throw error;
      }
    }
  }
}

export async function startDeepResearch({
  contextId,
  model,
  research,
  tavilyClient,
  maxDepth,
  onProgress,
  debug,
}: {
  contextId: string;
  model: LanguageModelV1;
  research: Research;
  tavilyClient: TavilyClient;
  maxDepth: number;
  onProgress?: (progress: ResearchProgress) => void;
  debug: Debugger;
}) {
  console.log("=======STARTING-DEEP-RESEARCH=======");

  let queries = research.queries.slice();
  let depth = 1;

  const progress: ResearchProgress = {
    currentDepth: depth,
    totalDepth: maxDepth,
    totalQueries: queries.length,
    completedQueries: 0,
  };

  const reportProgress = (update: Partial<ResearchProgress>) => {
    Object.assign(progress, update);
    onProgress?.(progress);
  };

  while (queries.length > 0) {
    const _queries = queries.slice();
    queries = [];

    await Promise.allSettled(
      _queries.map((query) =>
        limit(async () => {
          console.log("Executing query:", query);

          const id = Date.now().toString();

          reportProgress({
            currentQuery: query.query,
            currentDepth: depth,
          });

          try {
            const { results } = await tavilyClient.search(query.query, {
              maxResults: 5,
              searchDepth: "advanced",
            });

            await retry(
              "research:results",
              async () => {
                debug(
                  contextId,
                  ["research-query-results-data", id],
                  JSON.stringify(
                    {
                      research,
                      goal: query.goal,
                      query: query.query,
                      results: results,
                    },
                    null,
                    2
                  )
                );

                const system = searchResultsPrompt({
                  research,
                  goal: query.goal,
                  query: query.query,
                  results: results,
                  schema: searchResultsSchema,
                });

                debug(contextId, ["research-query-results-prompt", id], system);

                const res = await generateText({
                  model,
                  abortSignal: AbortSignal.timeout(60_000),
                  system,
                  messages: [
                    {
                      role: "assistant",
                      content: "<think>",
                    },
                  ],
                });

                const text = "<think>" + res.text;

                debug(contextId, ["research-query-results-response", id], text);

                try {
                  const { think, output } = searchResultsParser(text);
                  if (output) {
                    // console.log(output);
                    research.learnings.push(
                      ...output.learnings.map((l) => l.content)
                    );

                    if (depth < maxDepth) {
                      queries.push(...output.followUpQueries);
                    }
                  } else {
                    console.log(text);
                  }
                } catch (error) {
                  console.log("failed parsing");
                  throw error;
                }
              },
              3
            );

            reportProgress({
              completedQueries: progress.completedQueries + 1,
            });
          } catch (error) {
            console.error("Error processing query:", query.query, error);
            reportProgress({
              completedQueries: progress.completedQueries + 1,
            });
          }
        })
      )
    );

    depth++;
    research.queries.push(...queries);

    reportProgress({
      totalQueries: progress.totalQueries + queries.length,
    });
  }

  console.log(research);

  const id = Date.now().toString();

  const reportPrompt = finalReportPrompt({ research });

  debug(
    contextId,
    ["research-report-data", id],
    JSON.stringify(research, null, 2)
  );

  debug(contextId, ["research-report-prompt", id], reportPrompt);

  const res = await generateText({
    model,
    system: reportPrompt,
    messages: [
      {
        role: "assistant",
        content: "<think>",
      },
    ],
  });

  console.log("====FINAL REPORT=====");
  console.log("<think>" + res.text);
  debug(contextId, ["research-report-response", id], "<think>" + res.text);

  const report = res.text.slice(res.text.lastIndexOf("</think>"));
  console.log({ report });
  return report;
}

const startDeepResearchAction = action({
  name: "start-deep-research",
  schema: researchSchema,
  async handler(call, ctx, agent) {
    const research: Research = {
      ...call.data,
      learnings: [],
      status: "in_progress",
    };

    ctx.memory.researches.push(research);

    startDeepResearch({
      model: agent.reasoningModel ?? agent.model,
      research,
      tavilyClient: agent.container.resolve(tavily),
      maxDepth: call.data.maxDepth ?? 2,
      contextId: ctx.id,
      debug: agent.debugger,
    })
      .then((res) => {
        ctx.memory.results.push({
          ref: "action_result",
          callId: call.id,
          data: res,
          name: call.name,
          timestamp: Date.now(),
          processed: false,
        });

        return agent.run(ctx.id);
      })
      .catch((err) => console.error(err));

    return "Research created!";
  },
});

const cancelResearchAction = action({
  name: "cancel-deep-research",
  schema: researchSchema,
  enabled: (ctx) => ctx.memory.researches.length > 0,
  async handler(params, ctx) {
    return "Research canceled!";
  },
});

export const researchDeepActions = [
  startDeepResearchAction,
  cancelResearchAction,
];
