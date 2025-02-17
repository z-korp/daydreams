import type { Debugger } from "./types";
import { randomUUID } from "crypto";

export type TaskOptions = {
  limit?: number;
  retry?: number;
  debug?: Debugger;
  priority?: number;
};

export type TaskContext = {
  callId: string;
  debug: Debugger;
};

export type Task<Params, Result> = {
  (params: Params, options?: TaskOptions): Promise<Result>;
};

interface QueuedTask {
  id: string;
  execute: () => Promise<any>;
  priority: number;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

export class TaskRunner {
  private queue: QueuedTask[] = [];
  private running: Set<string> = new Set();
  private concurrency: number;

  constructor(concurrency: number = 1) {
    this.concurrency = concurrency;
  }

  setConcurrency(concurrency: number) {
    this.concurrency = concurrency;
    this.processQueue();
  }

  private async processQueue() {
    if (this.running.size >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.queue.sort((a, b) => b.priority - a.priority);

    const task = this.queue.shift();
    if (!task) return;

    this.running.add(task.id);

    try {
      const result = await task.execute();
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.running.delete(task.id);
      this.processQueue();
    }
  }

  enqueue<T>(taskFn: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      const queuedTask: QueuedTask = {
        id: randomUUID(),
        execute: taskFn,
        priority,
        resolve,
        reject,
      };

      this.queue.push(queuedTask);
      this.processQueue();
    });
  }

  get activeTasksCount(): number {
    return this.running.size;
  }

  get queuedTasksCount(): number {
    return this.queue.length;
  }
}

export function task<Params, Result>(
  key: string,
  fn: (params: Params, ctx: TaskContext) => Promise<Result>,
  runner: TaskRunner,
  defaultOptions?: TaskOptions
): Task<Params, Result> {
  async function call(params: Params, callOptions?: TaskOptions) {
    const callId = randomUUID();

    const options = {
      ...defaultOptions,
      ...callOptions,
    };

    return runner.enqueue(async () => {
      try {
        const res = await Promise.resolve(
          fn(params, {
            callId,
            debug: options?.debug ?? (() => {}),
          })
        );
        return res;
      } catch (error) {
        throw error;
      }
    }, options.priority);
  }

  return Object.assign(call, {});
}
