import zodToJsonSchema from "zod-to-json-schema";
import type { Action, InputRef, Output, OutputRef } from "./types";
import { formatXml } from "./xml";

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
            typeof input.data === "string"
                ? input.data
                : JSON.stringify(input.data),
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
            output.description,
            {
                tag: "schema",
                content: JSON.stringify(
                    zodToJsonSchema(output.params, "output").definitions!.output
                ),
            },
        ],
    });
}

/**
 * Formats an action definition into XML format
 * @param action - The action to format
 * @returns XML string representation of the action
 */
export function formatAction(action: Action) {
    return formatXml({
        tag: "action",
        params: { name: action.name },
        content: JSON.stringify(zodToJsonSchema(action.params, "action")),
    });
}
