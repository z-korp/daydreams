import { z } from "zod";
import type { Action } from "../types";
import { tavily } from "@tavily/core";

const envSchema = z.object({
    TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),
});

envSchema.parse(process.env);

const tavilyClient = tavily({
    apiKey: process.env.TAVILY_API_KEY!,
});

export const tavilySearch: Action = {
    name: "searchWeb",
    description: "Search the web for current information using Tavily",
    params: z.object({
        query: z.string().describe("The search query"),
        searchDepth: z
            .enum(["basic", "deep"])
            .optional()
            .describe(
                "The depth of search - basic is faster, deep is more thorough"
            ),
    }),
    async handler(params, ctx) {
        const response = await tavilyClient.search(params.query, {
            searchDepth: "advanced",
        });

        return {
            results: response.results.map((result) => ({
                title: result.title,
                url: result.url,
                content: result.content,
            })),
            totalResults: response.results.length,
        };
    },
};
