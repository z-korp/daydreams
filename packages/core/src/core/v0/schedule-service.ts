import { Logger } from "./logger";
import type { OrchestratorDb } from "./memory";
import type { ProcessorInterface } from "./processor";
import { LogLevel } from "./types";

export function createScheduler(
    orchestratorDb: OrchestratorDb,
    processor: ProcessorInterface,
    pollMs = 10_000,
    logLevel: LogLevel = LogLevel.INFO
) {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const logger = new Logger({
        level: logLevel,
        enableColors: true,
        enableTimestamp: true,
    });

    async function pollTasks() {
        try {
            const tasks = await orchestratorDb.findDueTasks();

            for (const task of tasks) {
                await orchestratorDb.markRunning(task._id);

                const handler = processor.getHandler(task.handlerName);
                if (!handler) {
                    logger.warn("No handler found", "warn", {
                        name: task.handlerName,
                    });
                    continue;
                }

                // parse out data
                const data = JSON.parse(task.taskData.task_data);

                if (!handler.execute) {
                    continue;
                }

                await processor.run(await handler.execute(data));

                // handle recurring or complete
                if (task.intervalMs) {
                    await orchestratorDb.updateNextRun(
                        task._id,
                        new Date(Date.now() + task.intervalMs)
                    );
                } else {
                    await orchestratorDb.markCompleted(task._id);
                }
            }
        } catch (err) {
            logger.error("pollTasks error", "error", {
                data: err,
            });
        }
    }

    // -- scheduleTaskInDb also as a standalone function
    async function scheduleTask(
        userId: string,
        handlerName: string,
        data: Record<string, unknown> = {},
        intervalMs?: number
    ): Promise<string> {
        const now = Date.now();
        const nextRunAt = new Date(now + (intervalMs ?? 0));

        logger.info(
            "SchedulerService.scheduleTaskInDb",
            `Scheduling task ${handlerName}`,
            {
                nextRunAt,
                intervalMs,
            }
        );

        return orchestratorDb.createTask(
            userId,
            handlerName,
            {
                request: handlerName,
                task_data: JSON.stringify(data),
            },
            nextRunAt,
            intervalMs
        );
    }

    // -- start function
    function start() {
        if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(() => pollTasks(), pollMs);
        logger.info(
            "SchedulerService.start",
            `Scheduler started polling with pollMs: ${pollMs}`
        );
    }

    // -- stop function
    function stop() {
        if (intervalId) {
            clearInterval(intervalId);
        }
    }

    // Return an object that gives you your needed “API”
    return {
        start,
        stop,
        scheduleTask,
    };
}
