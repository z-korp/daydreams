import { Logger } from "./logger";
import type { BaseProcessor } from "./processor";
import type {
    AgentRequest,
    Memory,
    ProcessableContent,
    ProcessedResult,
} from "./types";
import { HandlerRole, LogLevel, type LoggerConfig } from "./types";
import type { IOHandler } from "./types";

import type { FlowLifecycle } from "./life-cycle";
import type { OrchestratorMessage } from "./memory";

export class Orchestrator {
    /**
     * Unified collection of IOHandlers (both input & output).
     * Keyed by .name
     */
    private readonly ioHandlers = new Map<string, IOHandler>();

    /**
     * Logger instance for logging messages and errors.
     */
    private readonly logger: Logger;

    /**
     * Map of unsubscribe functions for various handlers.
     * Keyed by handler name.
     */
    private unsubscribers = new Map<string, () => void>();

    constructor(
        private processor: BaseProcessor,
        private readonly flowLifecycle: FlowLifecycle,
        config?: LoggerConfig
    ) {
        this.logger = new Logger(
            config ?? {
                level: LogLevel.ERROR,
                enableColors: true,
                enableTimestamp: true,
            }
        );

        this.logger.info(
            "Orchestrator.constructor",
            "Orchestrator initialized"
        );
    }

    public getHandler(name: string): IOHandler | undefined {
        return this.ioHandlers.get(name);
    }

    /**
     * Primary method to register any IOHandler (input or output).
     * - If it's an input with an interval, schedule it for recurring runs.
     * - Otherwise, just store it in the ioHandlers map.
     */
    public registerIOHandler(handler: IOHandler): void {
        if (this.ioHandlers.has(handler.name)) {
            this.logger.warn(
                "Orchestrator.registerIOHandler",
                "Overwriting handler with same name",
                { name: handler.name }
            );
        }

        this.ioHandlers.set(handler.name, handler);

        if (handler.role === "input" && handler.subscribe) {
            const unsubscribe = handler.subscribe(async (data) => {
                this.logger.info(
                    "Orchestrator.registerIOHandler",
                    "Starting stream",
                    { data }
                );
                // Simulate a request-like object here if you want a consistent approach.
                const fakeRequest: AgentRequest = { headers: {} };
                // Whenever data arrives, pass it into runAutonomousFlow
                await this.runAutonomousFlow(fakeRequest, data, handler.name);
            });
            this.unsubscribers.set(handler.name, unsubscribe);
        }

        this.logger.info(
            "Orchestrator.registerIOHandler",
            `Registered ${handler.role}`,
            { name: handler.name }
        );
    }

    /**
     * Removes a handler (input or output) by name, stopping scheduling if needed.
     */
    public removeIOHandler(name: string): void {
        // If we have an unsubscribe function, call it
        const unsub = this.unsubscribers.get(name);
        if (unsub) {
            unsub(); // e.g. remove event listeners, clear intervals, etc.
            this.unsubscribers.delete(name);
        }

        // Remove the handler itself
        this.ioHandlers.delete(name);

        this.logger.info("Orchestrator.removeIOHandler", "Removed IOHandler", {
            name,
        });
    }

    /**
     * Dispatches data to a registered *output* handler by name, passing in a request plus data.
     */
    public async dispatchToOutput<T>(
        name: string,
        request: AgentRequest,
        data: ProcessableContent
    ): Promise<unknown> {
        const handler = this.ioHandlers.get(name);
        if (!handler || !handler.execute) {
            throw new Error(`No IOHandler registered with name: ${name}`);
        }

        if (handler.role !== "output") {
            throw new Error(`Handler "${name}" is not an output handler`);
        }

        this.logger.debug("Orchestrator.dispatchToOutput", "Executing output", {
            name,
            data,
            headers: request.headers,
        });

        try {
            const result = await handler.execute(data);

            this.logger.info("Orchestrator.dispatchToOutput", "Output result", {
                result,
            });

            return result;
        } catch (error) {
            this.logger.error(
                "Orchestrator.dispatchToOutput",
                "Handler threw an error",
                {
                    name,
                    error,
                }
            );
            throw error;
        }
    }

    /**
     * Dispatches data to a registered *action* handler by name, passing in a request plus data.
     */
    public async dispatchToAction<T>(
        name: string,
        request: AgentRequest,
        data: ProcessableContent
    ): Promise<unknown> {
        const handler = this.ioHandlers.get(name);
        if (!handler || !handler.execute) {
            throw new Error(`No IOHandler registered with name: ${name}`);
        }
        if (handler.role !== "action") {
            throw new Error(`Handler "${name}" is not an action handler`);
        }

        try {
            const result = await handler.execute(data);

            this.logger.debug(
                "Orchestrator.dispatchToAction",
                "Executing action",
                {
                    name,
                    data,
                    headers: request.headers,
                }
            );
            return result;
        } catch (error) {
            this.logger.error(
                "Orchestrator.dispatchToAction",
                "Handler threw an error",
                {
                    name,
                    error,
                }
            );
            throw error;
        }
    }

    /**
     * Dispatches data to a registered *input* handler by name, passing in a request plus data.
     * Then continues through the autonomous flow.
     */
    public async dispatchToInput<T>(
        name: string,
        request: AgentRequest,
        data: ProcessableContent,
        orchestratorId?: string
    ): Promise<unknown> {
        const handler = this.ioHandlers.get(name);
        if (!handler) throw new Error(`No IOHandler: ${name}`);
        if (!handler.execute) {
            throw new Error(`Handler "${name}" has no execute method`);
        }
        if (handler.role !== "input") {
            throw new Error(`Handler "${name}" is not role=input`);
        }

        try {
            // Possibly run a transformation or normalizing step inside `handler.execute`
            const result = await handler.execute(data);

            if (result) {
                return await this.runAutonomousFlow(
                    request,
                    result,
                    handler.name,
                    orchestratorId
                );
            }
            return [];
        } catch (error) {
            this.logger.error(
                "Orchestrator.dispatchToInput",
                `dispatchToInput Error: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            throw error;
        }
    }

    /**
     * Takes some incoming piece of data, processes it through the system,
     * and handles any follow-on "action" or "output" suggestions in a queue.
     *
     * @param request        A request-like object (headers, etc.) from which we extract user info
     * @param initialData    The data payload to process
     * @param sourceName     The IOHandler name that provided this data
     * @param orchestratorId An optional existing orchestrator record ID to tie into
     */
    private async runAutonomousFlow(
        request: AgentRequest,
        initialData: unknown,
        sourceName: string,
        orchestratorId?: string
    ) {
        // For illustration, extract userId from headers. Adjust the header name as needed.
        const userId = request.headers["x-user-id"] || "agent";

        const queue: Array<{ data: unknown; source: string }> = [];

        if (Array.isArray(initialData)) {
            for (const item of initialData) {
                queue.push({ data: item, source: sourceName });
            }
        } else {
            queue.push({ data: initialData, source: sourceName });
        }

        // Optionally store final outputs to return
        const outputs: Array<{ name: string; data: any }> = [];

        // 1. Fire the "flow start" hook (could create or fetch an orchestrator record).
        if (this.flowLifecycle?.onFlowStart) {
            const maybeId = await this.flowLifecycle.onFlowStart(
                userId,
                sourceName,
                initialData
            );
            if (maybeId) {
                orchestratorId = maybeId;
            }
        }

        // 2. Process items in a queue
        while (queue.length > 0) {
            const { data, source } = queue.shift()!;

            // 2a. Notify the flowStep hook that we have new input
            if (this.flowLifecycle?.onFlowStep) {
                await this.flowLifecycle.onFlowStep(
                    orchestratorId,
                    userId,
                    HandlerRole.INPUT,
                    source,
                    data
                );
            }

            // 2b. The main processing
            const processedResults = await this.processContent(
                data as ProcessableContent | ProcessableContent[],
                source,
                userId
            );
            if (!processedResults || processedResults.length === 0) {
                continue;
            }

            for (const processed of processedResults) {
                if (processed.alreadyProcessed) continue;

                // 2c. If we have tasks to schedule, pass them to the hook
                if (
                    processed.updateTasks?.length &&
                    this.flowLifecycle?.onTasksScheduled
                ) {
                    await this.flowLifecycle.onTasksScheduled(
                        userId,
                        processed.updateTasks.map((task) => ({
                            name: task.name,
                            data: task.data,
                            intervalMs: task.intervalMs,
                        }))
                    );
                }

                // 2d. For each suggested output/action, dispatch them
                for (const output of processed.suggestedOutputs ?? []) {
                    const handler = this.ioHandlers.get(output.name);
                    if (!handler) {
                        this.logger.warn(
                            "Orchestrator.runAutonomousFlow",
                            `No handler found for suggested output: ${output.name}`
                        );
                        continue;
                    }

                    if (handler.role === HandlerRole.OUTPUT) {
                        outputs.push({ name: output.name, data: output.data });
                        await this.dispatchToOutput(
                            output.name,
                            request,
                            output.data
                        );

                        // Notify the flowStep hook that we output something
                        if (this.flowLifecycle?.onFlowStep) {
                            await this.flowLifecycle.onFlowStep(
                                orchestratorId,
                                userId,
                                HandlerRole.OUTPUT,
                                output.name,
                                output.data
                            );
                        }
                        // Or specifically call onOutputDispatched if you prefer:
                        if (this.flowLifecycle?.onOutputDispatched) {
                            await this.flowLifecycle.onOutputDispatched(
                                orchestratorId,
                                userId,
                                output.name,
                                output.data
                            );
                        }
                    } else if (handler.role === HandlerRole.ACTION) {
                        const actionResult = await this.dispatchToAction(
                            output.name,
                            request,
                            output.data
                        );

                        // Notify a flow step or action-dispatched hook
                        if (this.flowLifecycle?.onFlowStep) {
                            await this.flowLifecycle.onFlowStep(
                                orchestratorId,
                                userId,
                                HandlerRole.ACTION,
                                output.name,
                                { input: output.data, result: actionResult }
                            );
                        }
                        if (this.flowLifecycle?.onActionDispatched) {
                            await this.flowLifecycle.onActionDispatched(
                                orchestratorId,
                                userId,
                                output.name,
                                output.data,
                                actionResult
                            );
                        }

                        // If the action returns new data, queue it up
                        if (actionResult) {
                            if (Array.isArray(actionResult)) {
                                for (const item of actionResult) {
                                    queue.push({
                                        data: item,
                                        source: output.name,
                                    });
                                }
                            } else {
                                queue.push({
                                    data: actionResult,
                                    source: output.name,
                                });
                            }
                        }
                    } else {
                        this.logger.warn(
                            "Orchestrator.runAutonomousFlow",
                            "Suggested output has an unrecognized role",
                            handler.role
                        );
                    }
                }
            }
        }

        // 3. Return final outputs, or handle them as you see fit
        return outputs;
    }

    /**
     * Processes *any* content by splitting it into items (if needed) and
     * calling the single-item processor.
     */
    public async processContent(
        content: ProcessableContent | ProcessableContent[],
        source: string,
        userId?: string
    ): Promise<ProcessedResult[]> {
        if (Array.isArray(content)) {
            const allResults: ProcessedResult[] = [];
            for (const item of content) {
                // Example delay: remove if not needed
                await new Promise((resolve) => setTimeout(resolve, 5000));
                const result = await this.processContentItem(
                    item,
                    source,
                    userId
                );
                if (result) {
                    allResults.push(result);
                }
            }
            return allResults;
        }

        const singleResult = await this.processContentItem(
            content,
            source,
            userId
        );
        return singleResult ? [singleResult] : [];
    }

    /**
     * Process a single item:
     *  - Retrieves prior memories from its conversation
     *  - Passes it to the main (or "master") processor
     *  - Saves result to memory & marks processed if relevant
     */
    private async processContentItem(
        content: ProcessableContent,
        source: string,
        userId?: string
    ): Promise<ProcessedResult | null> {
        let memories: {
            memories: Memory[];
            chatHistory: OrchestratorMessage[];
        } = { memories: [], chatHistory: [] };

        if (
            content.conversationId &&
            content.contentId &&
            this.flowLifecycle?.onCheckContentProcessed
        ) {
            const hasProcessed =
                await this.flowLifecycle.onCheckContentProcessed(
                    content.contentId,
                    content.conversationId
                );

            if (hasProcessed) {
                this.logger.debug(
                    "Orchestrator.processContentItem",
                    "Content already processed",
                    {
                        contentId: content.contentId,
                        conversationId: content.conversationId,
                        userId,
                    }
                );
                return null;
            }

            if (userId && this.flowLifecycle?.onMemoriesRequested) {
                // Ensure the conversation
                const conversation =
                    await this.flowLifecycle.onConversationCreated(
                        userId,
                        content.conversationId,
                        source
                    );

                memories = await this.flowLifecycle.onMemoriesRequested(
                    conversation.id
                );

                this.logger.debug(
                    "Orchestrator.processContentItem",
                    "Processing content with context",
                    {
                        content,
                        source,
                        conversationId: conversation.id,
                        userId,
                        relevantMemories: memories,
                    }
                );
            }
        }

        // Gather possible outputs & actions
        const availableOutputs = Array.from(this.ioHandlers.values()).filter(
            (h) => h.role === HandlerRole.OUTPUT
        );
        const availableActions = Array.from(this.ioHandlers.values()).filter(
            (h) => h.role === HandlerRole.ACTION
        );

        // Processor main entry point
        const result = await this.processor.process(
            content,
            JSON.stringify(memories),
            {
                availableOutputs,
                availableActions,
            }
        );

        // If there's a conversationId, store the memory and mark processed
        if (
            content.conversationId &&
            result &&
            content.contentId &&
            this.flowLifecycle?.onMemoryAdded &&
            this.flowLifecycle?.onConversationUpdated
        ) {
            await this.flowLifecycle.onMemoryAdded(
                content.conversationId,
                JSON.stringify(result.content),
                source,
                {
                    ...result.metadata,
                    ...result.enrichedContext,
                }
            );
            await this.flowLifecycle.onConversationUpdated(
                content.contentId,
                content.conversationId,
                JSON.stringify(result.content),
                source,
                result.metadata
            );
        }

        return result;
    }
}
