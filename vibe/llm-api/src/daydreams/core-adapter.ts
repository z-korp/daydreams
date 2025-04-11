/**
 * This adapter provides compatibility for importing the ESM-based @daydreamsai/core package
 * from CommonJS NestJS modules.
 */

// Re-export types and functions from the core package
import { createDreams as originalCreateDreams } from "@daydreamsai/core";
import { LogLevel } from "@daydreamsai/core";
import { action } from "@daydreamsai/core";
import { context } from "@daydreamsai/core";
import { input } from "@daydreamsai/core";
import { output, OutputResponse } from "@daydreamsai/core";
import { formatMsg } from "@daydreamsai/core";

// Re-export everything for use in this project
export {
  originalCreateDreams as createDreams,
  LogLevel,
  action,
  context,
  input,
  output,
  OutputResponse,
  formatMsg,
};
