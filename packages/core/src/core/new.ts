import type { z } from "zod";
import type { MemoryManager } from "./memory";
import type { Goal, IOHandler, ProcessableContent, ProcessedResult } from "./types";

// Routers to handlers or processors
export interface ProcessorInterface {
    // hold the schema
    outputSchema: z.ZodType;

    // hold the processors
    processors: ProcessorInterface[];

    // hold the always child processor
    alwaysChildProcessor?: ProcessorInterface;

    // hold the IOHandlers
    handlers: HandlerInterface;

    // based on inputs and outputs
    process: (content: ProcessableContent) => Promise<ProcessedResult>;

    // based on inputs and outputs
    evaluate: (result: ProcessedResult) => Promise<boolean>;

    // memory manager // what it's done
    memory: MemoryManager;
}

// IOHandlers.ts
export interface HandlerInterface {
    // hold the IOHandlers
    ioHandlers: Map<string, IOHandler>;

    dispatchToAction(
        name: string,
        data: ProcessableContent
    ): Promise<unknown>;
    dispatchToOutput(
        name: string,
        data: ProcessableContent
    ): Promise<unknown>;
    dispatchToInput(
        name: string,
        data: ProcessableContent
    ): Promise<unknown>;
    registerIOHandler(handler: IOHandler): void;
    removeIOHandler(name: string): void;
}

// GoalManager.ts
export interface GoalManagerInterface {
    /**
     * Replaces all current goals with a new array of goals.
     */
    setGoals(goals: Goal[]): void;

    /**
     * Adds a single goal to the manager.
     */
    addGoal(goal: Goal): void;

    /**
     * Retrieves all goals (optionally filtered).
     */
    getGoals(filterFn?: (goal: Goal) => boolean): Goal[];

    /**
     * Retrieves a specific goal by ID.
     */
    getGoalById(id: string): Goal | undefined;

    /**
     * Updates the status of a given goal (e.g., pending -> in_progress -> completed).
     */
    updateGoalStatus(goalId: string, status: Goal["status"]): void;

    /**
     * Updates progress (0-100) for a goal in progress.
     */
    updateGoalProgress(goalId: string, progress: number): void;

    /**
     * Marks a goal as completed, optionally setting an outcome score and completed_at timestamp.
     */
    markGoalCompleted(goalId: string, outcomeScore?: number): void;

    /**
     * Logs a new score in the scoreHistory array.
     */
    logGoalScore(goalId: string, score: number, comment?: string): void;
}

// MemoryManager.ts
export interface MemoryManagerInterface {
    storeMemory(key: string, data: any): void;
    retrieveMemory(query: string): any[];
    updateMemory(key: string, data: any): void;
    removeMemory(key: string): void;
}

// Evaluation.ts
export interface EvaluationInterface {
    evaluate(result: any, goals: string[]): { success: boolean; details: string };
    getImprovementSuggestions(
        evaluationReport: { success: boolean; details: string }
    ): string[];
}


