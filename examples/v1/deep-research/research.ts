import { render } from "@daydreamsai/core/src/core/v1/utils";
import { createTagParser, formatXml } from "@daydreamsai/core/src/core/v1/xml";
import { TavilyClient } from "@tavily/core";
import { generateText, LanguageModelV1 } from "ai";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export type Research = {
  id: string;
  name: string;
  queries: {
    query: string;
    goal: string;
    results?: any[];
    learnings?: any[];
  }[];
  questions: string[];
  learnings: string[];
  status: "in_progress" | "done";
};

const thinkParser = createTagParser("think");
const outputParser = createTagParser("output", (t) =>
  searchResultsSchema.parse(JSON.parse(t))
);

const actionParser = createTagParser("action", (t) => JSON.parse(t));
const reasoningParser = createTagParser("reasoning");
const responseParser = createTagParser("response");

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

export async function startDeepResearch({
  model,
  research,
  tavilyClient,
}: {
  model: LanguageModelV1;
  research: Research;
  tavilyClient: TavilyClient;
}) {
  console.log("=======STARTING-DEEP-RESEARCH=======");

  let queries = research.queries.slice();

  let step = 1;

  while (queries.length > 0) {
    const _queries = queries.slice();

    queries = [];

    await Promise.all(
      _queries.map(async (query) => {
        console.log("Executing query:", query);
        const { results } = await tavilyClient.search(query.query, {
          maxResults: 5,
          searchDepth: "advanced",
        });

        const res = await generateText({
          model: model,
          // abortSignal: AbortSignal.timeout(60_000),
          system: render(
            `
{{research}}

<goal>{{goal}}</goal>

<query>{{query}}</query>

<results>
{{results}}
</results>

Given the following results from a SERP search for the query, generate a list of learnings from the results. 
Return a maximum of 5 learnings, but feel free to return less if the results are clear. 
Make sure each learning is unique and not similar to each other. 
The learnings should be concise and to the point, as detailed and information dense as possible. 
Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any exact metrics, numbers, or dates. 
The learnings will be used to research the topic further.
Given the following query and results from the research, create some follow up queries to clarify the research direction. 
Return a maximum of 2 queries, but feel free to return less if the original query is clearer

Here is the json schema:
{{schema}}

Here's an example of how to structure your output:
<output>
[JSON RESPONSE FROM SCHEMA]
</output>
`,
            {
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
            }
          ),
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

            if (step < 2) {
              queries.push(...output.content.followUpQueries);
            }
          } else {
            console.log(text);
          }
        } catch (error) {
          console.log("failed parsing");
        }

        // query.results = [...results];
        // query.learnings = [...res.object.learnings];
      })
    );

    step++;

    research.queries.push(...queries);
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
}

// function renderContext(context: Context) {
//   return render(
//     `
// <logs>
// {{logs}}
// <logs>
// <researches>
// {{researches}}
// </researches>
//   `,
//     {
//       logs: [
//         ...context.inputs.filter((i) => i.processed === true),
//         ...context.outputs,
//         ...context.calls,
//         ...context.results,
//       ].map(formatContext),
//       researches: context.researches.map((r) =>
//         formatXml({
//           tag: "research",
//           params: { id: r.id },
//           content: JSON.stringify(r),
//         })
//       ),
//     }
//   );
// }
