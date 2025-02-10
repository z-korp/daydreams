import zodToJsonSchema from "zod-to-json-schema";
import type { Action, InputRef, Log, Output, OutputRef } from "./types";
import { formatXml } from "./xml";
import { formatValue } from "./utils";

/**
 * Formats an input reference into XML format
 * @param input - The input reference to format
 * @returns XML string representation of the input
 */
export function formatInput(input: InputRef) {
  return formatXml({
    tag: "input",
    params: { name: input.type, ...input.params },
    content:
      typeof input.data === "string" ? input.data : JSON.stringify(input.data),
  });
}

/**
 * Formats an output reference into XML format
 * @param output - The output reference to format
 * @returns XML string representation of the output
 */
export function formatOutput(output: OutputRef) {
  return formatXml({
    tag: "output",
    params: { name: output.type, ...output.params },
    content:
      typeof output.data === "string"
        ? output.data
        : JSON.stringify(output.data),
  });
}

/**
 * Formats an output interface definition into XML format
 * @param output - The output interface to format
 * @returns XML string representation of the output interface
 */
export function formatOutputInterface(output: Output) {
  return formatXml({
    tag: "output",
    params: { name: output.type },
    content: [
      { tag: "instructions", content: output.description },
      {
        tag: "schema",
        content: JSON.stringify(zodToJsonSchema(output.schema, "output")),
      },
    ],
  });
}

export function formatAction(action: Action<any, any, any>) {
  return formatXml({
    tag: "action",
    params: { name: action.name },
    content: [
      action.description
        ? {
            tag: "description",
            content: action.description,
          }
        : null,
      action.schema
        ? {
            tag: "schema",
            content: JSON.stringify(zodToJsonSchema(action.schema, "action")),
          }
        : null,
    ].filter((t) => !!t),
  });
}

export function formatContext(i: Log) {
  switch (i.ref) {
    case "input":
      return formatXml({
        tag: "msg",
        params: {
          ...i.params,
          role: "user",
        },
        content: formatValue(i.data),
      });
    case "output":
      return formatXml({
        tag: "msg",
        params: {
          ...i.params,
          role: "assistant",
        },
        content: formatValue(i.data),
      });
    case "thought":
      return formatXml({
        tag: "reflection",
        params: { role: "assistant" },
        content: i.content,
      });
    case "action_call":
      return formatXml({
        tag: "action_call",
        params: { id: i.id, name: i.name },
        content: JSON.stringify(i.data),
      });
    case "action_result":
      return formatXml({
        tag: "action_result",
        params: { name: i.name, callId: i.callId },
        content: JSON.stringify(i.data),
      });
    default:
      throw new Error("invalid context");
  }
}
