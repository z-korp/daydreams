import { Handler } from "./orchestrator";
import type { Goal, IOHandler, ProcessableContent, ProcessedResult } from "./types";

// IOHandlers.ts
export interface IOHandlerInterface {
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

// Processor.ts - a processor is a function that takes in a ProcessableContent and returns a Promise<unknown>
export interface ProcessorInterface {
    process(data: ProcessableContent): Promise<ProcessedResult>;
}

// Router.ts
export interface RouterInterface {
    routeRequest(request: any): any;
    configurePipeline(pipelineSteps: Array<Function>): void;
    addPipelineStep(step: Function): void;
    removePipelineStep(step: Function): void;
    setReflectionHook(hook: (context: any, stepIndex: number) => {
        shouldContinue: boolean;
        updatedContext: any;
    }): void;
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


