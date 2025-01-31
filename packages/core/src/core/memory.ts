import type { HandlerRole, Memory } from "./types";
import type { Conversation } from "./conversation";

// Define interfaces matching MongoDB document shapes
export interface ScheduledTask {
    _id: string;
    userId: string;
    handlerName: string;
    taskData: Record<string, any>;
    nextRunAt: Date;
    intervalMs?: number;
    status: "pending" | "running" | "completed" | "failed";
    createdAt: Date;
    updatedAt: Date;
}

export interface OrchestratorMessage {
    role: HandlerRole;
    name: string;
    data: unknown;
    timestamp: Date;
}

export interface OrchestratorChat {
    _id?: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    messages: OrchestratorMessage[];
}

export interface OrchestratorDb {
    connect(): Promise<void>;
    close(): Promise<void>;

    // Orchestrator methods
    getOrchestratorById(id: string): Promise<OrchestratorChat | null>;
    getOrchestratorsByUserId(userId: string): Promise<OrchestratorChat[]>;
    createOrchestrator(userId: string): Promise<string>;
    addMessage(
        conversationId: string,
        role: HandlerRole,
        name: string,
        data: any
    ): Promise<void>;
    getMessages(conversationId: string): Promise<OrchestratorMessage[]>;

    // Task management methods
    createTask(
        userId: string,
        handlerName: string,
        taskData: Record<string, any>,
        nextRunAt: Date,
        intervalMs?: number
    ): Promise<string>;
    findDueTasks(limit?: number): Promise<ScheduledTask[]>;
    markRunning(taskId: string): Promise<void>;
    markCompleted(taskId: string, failed?: boolean): Promise<void>;
    updateNextRun(taskId: string, newRunTime: Date): Promise<void>;
    rescheduleIfRecurring(task: ScheduledTask): Promise<void>;
    deleteAll(): Promise<void>;
}

export interface MemoryManager {
    hasProcessedContentInConversation(
        contentId: string,
        conversationId: string
    ): Promise<boolean>;
    ensureConversation(
        conversationId: string,
        source: string,
        userId?: string
    ): Promise<Conversation>;
    getMemoriesFromConversation(conversationId: string): Promise<Memory[]>;
    addMemory(
        conversationId: string,
        content: string,
        metadata?: any
    ): Promise<void>;
    markContentAsProcessed(
        contentId: string,
        conversationId: string
    ): Promise<void>;
}
