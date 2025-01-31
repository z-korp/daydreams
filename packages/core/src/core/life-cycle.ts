// MyFlowLifecycle.ts

import { HandlerRole, type Memory } from "./types";
// Suppose we have an OrchestratorDb or some DB client:
import type { OrchestratorDb, OrchestratorMessage } from "./memory";
import type { ConversationManager } from "./conversation-manager";
import type { Conversation } from "./conversation";

export function makeFlowLifecycle(
    orchestratorDb: OrchestratorDb,
    conversationManager: ConversationManager
): FlowLifecycle {
    return {
        async onFlowStart(
            userId: string,
            sourceName: string,
            initialData: unknown
        ): Promise<string | undefined> {
            return await orchestratorDb.createOrchestrator(userId);
        },

        async onFlowStep(
            orchestratorId: string | undefined,
            userId: string,
            role: HandlerRole,
            sourceName: string,
            data: unknown
        ): Promise<void> {
            if (!orchestratorId) return;
            await orchestratorDb.addMessage(
                orchestratorId,
                role,
                sourceName,
                data
            );
        },

        async onTasksScheduled(
            userId: string,
            tasks: { name: string; data: unknown; intervalMs?: number }[]
        ): Promise<void> {
            for (const task of tasks) {
                const now: number = Date.now();
                const nextRunAt: Date = new Date(now + (task.intervalMs ?? 0));
                await orchestratorDb.createTask(
                    userId,
                    task.name,
                    {
                        request: task.name,
                        task_data: JSON.stringify(task.data),
                    },
                    nextRunAt,
                    task.intervalMs
                );
            }
        },

        async onOutputDispatched(
            orchestratorId: string | undefined,
            userId: string,
            outputName: string,
            outputData: unknown
        ): Promise<void> {
            if (!orchestratorId) return;
            await orchestratorDb.addMessage(
                orchestratorId,
                HandlerRole.OUTPUT,
                outputName,
                outputData
            );
        },

        async onActionDispatched(
            orchestratorId: string | undefined,
            userId: string,
            actionName: string,
            inputData: unknown,
            result: unknown
        ): Promise<void> {
            if (!orchestratorId) return;
            await orchestratorDb.addMessage(
                orchestratorId,
                HandlerRole.ACTION,
                actionName,
                {
                    input: inputData,
                    result,
                }
            );
        },

        async onContentProcessed(
            contentId: string,
            conversationId: string,
            content: string,
            metadata?: Record<string, unknown>
        ): Promise<void> {
            const hasProcessed =
                await conversationManager.hasProcessedContentInConversation(
                    contentId,
                    conversationId
                );
            if (hasProcessed) {
                return;
            }
            await conversationManager.markContentAsProcessed(
                contentId,
                conversationId
            );
        },

        async onConversationCreated(
            userId: string,
            conversationId: string,
            source: string
        ): Promise<Conversation> {
            return await conversationManager.ensureConversation(
                conversationId,
                source,
                userId
            );
        },

        async onConversationUpdated(
            contentId: string,
            conversationId: string,
            content: string,
            source: string,
            updates: Record<string, unknown>
        ): Promise<void> {
            await conversationManager.markContentAsProcessed(
                contentId,
                conversationId
            );
        },

        async onMemoryAdded(
            conversationId: string,
            content: string,
            source: string,
            updates: Record<string, unknown>
        ): Promise<void> {
            await conversationManager.addMemory(conversationId, content, {
                source,
                ...updates,
            });

            await orchestratorDb.addMessage(
                conversationId,
                HandlerRole.INPUT,
                source,
                {
                    content,
                    conversationId,
                }
            );
        },

        async onMemoriesRequested(
            conversationId: string,
            limit?: number
        ): Promise<{ memories: Memory[]; chatHistory: OrchestratorMessage[] }> {
            console.log("onMemoriesRequested", conversationId, limit);
            // get vector based memories
            // todo, we could base this on a userID so the agent has memories across conversations
            const memories =
                await conversationManager.getMemoriesFromConversation(
                    conversationId,
                    limit
                );
            // TODO: get history from db
            const chatHistory =
                await orchestratorDb.getMessages(conversationId);

            console.log("chatHistory", memories, chatHistory);

            return { memories, chatHistory };
        },

        async onCheckContentProcessed(
            contentId: string,
            conversationId: string
        ): Promise<boolean> {
            return await conversationManager.hasProcessedContentInConversation(
                contentId,
                conversationId
            );
        },
    };
}

/**
 * A set of optional lifecycle callbacks for orchestrator events.
 * The Orchestrator will call these methods if they are defined.
 */
export interface FlowLifecycle {
    /**
     * Called when a new flow is started or continued.
     * Allows you to create or fetch an Orchestrator record, returning an ID if relevant.
     */
    onFlowStart(
        userId: string,
        sourceName: string,
        initialData: unknown
    ): Promise<string | undefined>;

    /**
     * Called when new data is processed in the flow (e.g., an input message).
     */
    onFlowStep(
        orchestratorId: string | undefined,
        userId: string,
        role: HandlerRole,
        sourceName: string,
        data: unknown
    ): Promise<void>;

    /**
     * Called when the Orchestrator wants to schedule tasks (e.g. recurring tasks).
     * You can store them in your DB or in a queue system.
     */
    onTasksScheduled(
        userId: string,
        tasks: {
            name: string;
            data: unknown;
            intervalMs?: number;
        }[]
    ): Promise<void>;

    /**
     * Called after an output is dispatched (e.g. store it or log it).
     */
    onOutputDispatched(
        orchestratorId: string | undefined,
        userId: string,
        outputName: string,
        outputData: unknown
    ): Promise<void>;

    /**
     * Called after an action is dispatched (e.g. store it or log it).
     */
    onActionDispatched(
        orchestratorId: string | undefined,
        userId: string,
        actionName: string,
        inputData: unknown,
        result: unknown
    ): Promise<void>;

    /**
     * Called when content has been processed in a conversation
     */
    onContentProcessed(
        userId: string,
        conversationId: string,
        content: string,
        metadata?: Record<string, unknown>
    ): Promise<void>;

    /**
     * Called when a new conversation is created
     */
    onConversationCreated(
        userId: string,
        conversationId: string,
        source: string,
        metadata?: Record<string, unknown>
    ): Promise<Conversation>;

    /**
     * Called when a conversation is updated
     */
    onConversationUpdated(
        contentId: string,
        conversationId: string,
        content: string,
        source: string,
        updates: Record<string, unknown>
    ): Promise<void>;

    /**
     * Called when a new memory needs to be added to a conversation
     */
    onMemoryAdded(
        conversationId: string,
        content: string,
        source: string,
        updates: Record<string, unknown>
    ): Promise<void>;

    /**
     * Called when memories need to be retrieved for a conversation
     */
    onMemoriesRequested(
        conversationId: string,
        limit?: number
    ): Promise<{ memories: Memory[]; chatHistory: OrchestratorMessage[] }>;

    /**
     * Called to check if specific content has been processed in a conversation
     */
    onCheckContentProcessed(
        contentId: string,
        conversationId: string
    ): Promise<boolean>;
}
