import { llm } from "./llm";
import { createTagRegex, parseParams } from "./xml";
import { render } from "./utils";
import { type COTProps, type COTResponse } from "./types";
import {
    formatAction,
    formatInput,
    formatOutput,
    formatOutputInterface,
} from "./formatters";
import { randomUUID } from "crypto";

const promptTemplate = `
You are tasked with analyzing your current plan, inputs, formulating outputs, and initiating actions based on a that context. 
Your role is to process the information provided and respond in a structured manner.

<plan>
{{plan}}
</plan>

First, review the available actions you can initiate:
<available_actions>
{{actions}}
</available_actions>

Next, familiarize yourself with the types of outputs you can generate:
<outputs>
{{outputs}}
</outputs>

Next, remember the previous input/output logs
<logs>
{{conversation}}
</logs>

Now, consider the new input information provided:
<inputs>
{{inputs}}
</inputs>

When formulating your response, adhere to the following structure:

<response>
<thinking>[your thoughts]</thinking>

[List of async actions to be initiated, if applicable]
<action name="[action name]">[action data]</action>

[List of outputs to send, if applicable]
<output name="[output name]">[output data]</output>
</response>

Begin your response by carefully analyzing the inputs and context. Use the <thinking> tags to articulate your thought process, considering the available actions and potential outputs.

If you determine that actions should be initiated based on the input and context, list them after your thinking section. Use the <action> tags for each action, specifying the action name and including any relevant action data.

For any outputs you need to generate, use the <output> tags, specifying the output name and including the appropriate output data.

Remember to:
1. Create clear plans and revise them when needed
2. Thoroughly analyze the inputs before deciding on actions or outputs
3. Justify your decisions within the <thinking> section
4. Only initiate relevant actions and outputs based on the given context
5. Maintain a logical flow in your response

Your response should be comprehensive yet concise, demonstrating a clear understanding of the task and the ability to make informed decisions based on the provided information.`;

export async function chainOfThought({
    model,
    plan,
    actions,
    inputs,
    outputs,
    thoughts,
    conversation,
}: COTProps): Promise<COTResponse> {
    const prompt = render(promptTemplate, {
        plan,
        actions: actions.map(formatAction).join("\n"),
        conversation: conversation
            .map((i) => {
                const [type, ...key] = i.type.split(":");

                if (type === "input") {
                    return formatInput({
                        ...i,
                        type: key.join(":"),
                    });
                }

                if (type === "output") {
                    return formatOutput({
                        ...i,
                        type: key.join(":"),
                    });
                }
                return null;
            })
            .filter(Boolean)
            .join("\n"),
        // data: "",
        inputs: inputs.map(formatInput).join("\n"),
        outputs: outputs.map(formatOutputInterface).join("\n"),
    });

    console.log(prompt);

    const { response } = await llm({
        model,
        prompt: prompt + "\n<response>",
        stopSequences: ["</response>"],
    });

    const msg = response.messages[0];

    const text =
        msg.role === "assistant"
            ? Array.isArray(msg.content)
                ? msg.content
                    .map((t) => (t.type === "text" ? t.text : ""))
                    .join("\n")
                : msg.content
            : "";

    // todo: get this ordered for better outputs

    const plans = Array.from(text.matchAll(createTagRegex("plan"))).map(
        (t) => t[2]
    );

    const thinking = Array.from(text.matchAll(createTagRegex("thinking"))).map(
        (t) => t[2]
    );

    const outs = Array.from(text.matchAll(createTagRegex("output"))).map(
        (t) => {
            const { name } = parseParams(t[1]);
            return { type: name, data: t[2], timestamp: Date.now() };
        }
    );

    const calls = Array.from(text.matchAll(createTagRegex("action"))).map(
        (t) => {
            const { name } = parseParams(t[1]);
            return { id: randomUUID(), name, data: JSON.parse(t[2]) };
        }
    );

    console.dir(
        { text, thinking, outputs: outs, actions: calls, plans },
        { depth: Infinity }
    );

    return {
        plan: plans,
        actions: calls,
        outputs: outs,
        thinking,
    };
}
