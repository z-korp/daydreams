import zodToJsonSchema from "zod-to-json-schema";
import { Action, InputRef, Output, OutputRef } from "./types";
import { formatXml } from "./xml";

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

export function formatAction(action: Action) {
    return formatXml({
        tag: "action",
        params: { name: action.name },
        content: JSON.stringify(zodToJsonSchema(action.params, "action")),
    });
}
