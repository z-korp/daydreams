// businessLogic.ts

import { ProcessableContent, ProcessedResult } from "../packages/core/src/core/types";


export type HandlerRole = "INPUT" | "OUTPUT" | "ACTION";

export interface IOHandler {
    name: string;
    role: HandlerRole;
    execute?: (data: any) => Promise<any>;
    subscribe?: (callback: (data: any) => Promise<void>) => () => void;
}

// A container for external dependencies used in processing.
export interface Dependencies {
    flowHooks: {
        onFlowStart: (
            userId: string,
            platformId: string,
            threadId: string,
            data: any
        ) => Promise<string>;
        onFlowStep: (
            chatId: string,
            role: HandlerRole,
            source: string,
            data: any
        ) => Promise<void>;
        onTasksScheduled: (
            userId: string,
            tasks: Array<{ name: string; data: any; intervalMs: number }>
        ) => Promise<void>;
        onConversationCreated: (
            userId: string,
            threadId: string,
            source: string
        ) => Promise<{ id: string }>;
        onMemoriesRequested: (conversationId: string) => Promise<{ memories: any[] }>;
        onMemoryAdded: (
            conversationId: string,
            content: string,
            source: string,
            metadata: any
        ) => Promise<void>;
        onConversationUpdated: (
            contentId: string,
            conversationId: string,
            content: string,
            source: string,
            metadata: any
        ) => Promise<void>;
    };
    processor: {
        process: (
            content: ProcessableContent,
            memories: string,
            options: { availableOutputs: IOHandler[]; availableActions: IOHandler[] }
        ) => Promise<ProcessedResult>;
    };
    ioHandlers: Map<string, IOHandler>;
    dispatchToOutput: (name: string, data: ProcessableContent) => Promise<any>;
    dispatchToAction: (name: string, data: ProcessableContent) => Promise<any>;
}

/**
 * The main run function.
 * It initializes a processing queue and then delegates each item to processQueueItem.
 */
export async function run(
    data: ProcessableContent | ProcessableContent[],
    sourceName: string,
    dependencies: Dependencies
): Promise<Array<{ name: string; data: any }>> {
    // Initialize the processing queue.
    const queue: Array<{ data: ProcessableContent; source: string }> = Array.isArray(data)
        ? data.map((item) => ({ data: item, source: sourceName }))
        : [{ data, source: sourceName }];

    const collectedOutputs: Array<{ name: string; data: any }> = [];

    while (queue.length > 0) {
        const currentItem = queue.shift()!;
        const outputs = await processQueueItem(currentItem, queue, dependencies);
        collectedOutputs.push(...outputs);
    }

    return collectedOutputs;
}

/**
 * Processes one queue item:
 *  - Starts a conversation flow.
 *  - Processes the content.
 *  - Dispatches any suggested outputs or actions.
 */
export async function processQueueItem(
    item: { data: ProcessableContent; source: string },
    queue: Array<{ data: ProcessableContent; source: string }>,
    dependencies: Dependencies
): Promise<Array<{ name: string; data: any }>> {
    const { data, source } = item;
    const outputs: Array<{ name: string; data: any }> = [];

    // Start the conversation/flow.
    const chatId = await dependencies.flowHooks.onFlowStart(
        data.userId!,
        data.platformId!,
        data.threadId!,
        data.data
    );

    await dependencies.flowHooks.onFlowStep(chatId, "INPUT", source, data);

    // Process the content.
    const processedResults = await processContent(data, source, dependencies);
    if (!processedResults?.length) {
        return outputs;
    }

    // Handle each processed result.
    for (const result of processedResults) {
        if (result.alreadyProcessed) {
            continue;
        }

        // Schedule any tasks if present.
        if (result.updateTasks?.length) {
            await dependencies.flowHooks.onTasksScheduled(
                data.userId!,
                result.updateTasks.map((task) => ({
                    name: task.name,
                    data: task.data,
                    intervalMs: task.intervalMs,
                }))
            );
        }

        // Process any suggested outputs or actions.
        for (const suggestion of result.suggestedOutputs ?? []) {
            const handler = dependencies.ioHandlers.get(suggestion.name);
            if (!handler) {
                console.warn(`No handler found for suggested output: ${suggestion.name}`);
                continue;
            }

            switch (handler.role) {
                case "OUTPUT":
                    outputs.push({
                        name: suggestion.name,
                        data: suggestion.data,
                    });
                    await dependencies.dispatchToOutput(suggestion.name, suggestion.data);
                    await dependencies.flowHooks.onFlowStep(chatId, "OUTPUT", suggestion.name, suggestion.data);
                    break;

                case "ACTION": {
                    const actionResult = await dependencies.dispatchToAction(suggestion.name, suggestion.data);
                    await dependencies.flowHooks.onFlowStep(
                        chatId,
                        "ACTION",
                        suggestion.name,
                        { input: suggestion.data, result: actionResult }
                    );
                    if (actionResult) {
                        const newItems = Array.isArray(actionResult) ? actionResult : [actionResult];
                        for (const newItem of newItems) {
                            queue.push({ data: newItem, source: suggestion.name });
                        }
                    }
                    break;
                }

                default:
                    console.warn("Suggested output has an unrecognized role", handler.role);
            }
        }
    }

    return outputs;
}

/**
 * Processes the content.
 * If an array is provided, each item is processed (with an optional delay).
 */
export async function processContent(
    content: ProcessableContent | ProcessableContent[],
    source: string,
    dependencies: Dependencies
): Promise<ProcessedResult[]> {
    if (Array.isArray(content)) {
        const allResults: ProcessedResult[] = [];
        for (const item of content) {
            await delay(5000); // Example delay; remove if not needed.
            const result = await processContentItem(item, source, dependencies);
            if (result) {
                allResults.push(result);
            }
        }
        return allResults;
    }

    const singleResult = await processContentItem(content, source, dependencies);
    return singleResult ? [singleResult] : [];
}

/**
 * Processes a single content item:
 *  - Retrieves conversation context and prior memories.
 *  - Passes the item to the processor.
 *  - Updates conversation and memory.
 */
export async function processContentItem(
    content: ProcessableContent,
    source: string,
    dependencies: Dependencies
): Promise<ProcessedResult | null> {
    let memories: { memories: any[] } = { memories: [] };

    const conversation = await dependencies.flowHooks.onConversationCreated(
        content.userId!,
        content.threadId!,
        source
    );

    if (content.threadId && content.userId) {
        memories = await dependencies.flowHooks.onMemoriesRequested(conversation.id);
        console.debug("Processing content with context", {
            content,
            source,
            conversationId: conversation.id,
            userId: content.userId,
            relevantMemories: memories,
        });
    }

    // Collect available outputs and actions.
    const availableOutputs = Array.from(dependencies.ioHandlers.values()).filter(
        (h) => h.role === "OUTPUT"
    );
    const availableActions = Array.from(dependencies.ioHandlers.values()).filter(
        (h) => h.role === "ACTION"
    );

    // Process the content.
    const result = await dependencies.processor.process(
        content,
        JSON.stringify(memories),
        {
            availableOutputs,
            availableActions,
        }
    );

    // Save memory and update the conversation.
    await dependencies.flowHooks.onMemoryAdded(
        conversation.id,
        JSON.stringify(result.content),
        source,
        { ...result.metadata, ...result.enrichedContext }
    );

    console.debug("Updating conversation", {
        conversationId: conversation.id,
        contentId: content.contentId,
        threadId: content.threadId,
        userId: content.userId,
        result,
    });

    await dependencies.flowHooks.onConversationUpdated(
        content.contentId!,
        conversation.id,
        JSON.stringify(result.content),
        source,
        result.metadata
    );

    return result;
}

/**
 * A helper method to introduce a delay.
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
