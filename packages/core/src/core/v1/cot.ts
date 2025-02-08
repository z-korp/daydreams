import { llm } from "./llm";
import { createTagRegex, formatXml, parseParams } from "./xml";
import { render } from "./utils";
import type {
    ActionCall,
    OutputRef,
    Thought,
    COTProps,
    COTResponse,
} from "./types";
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

Next, remember the previous input/thinking/actions/output logs
<logs>
{{logs}}
</logs>

Now, consider the new input information provided, you should only respond with one message based on your history and the latest input:
<inputs>
{{inputs}}
</inputs>

When formulating your response, always adhere to the following structure:
<think>[your think process]</think>
<response>
[List of async actions to be initiated, if applicable]
<action name="[action name]">[action data]</action>

[List of outputs to send, if applicable]
<output name="[output name]">[output data]</output>
</response>

Begin your response by carefully analyzing the inputs and context. Use the <think> tags to articulate your thought process, considering the available actions and potential outputs.

If you determine that actions should be initiated based on the input and context, list them after your think section. Use the <action> tags for each action, specifying the action name and including any relevant action data.

For any outputs you need to generate, use the <output> tags, specifying the output name and including the appropriate output data.

Remember to:
1. Create clear plans and revise them when needed
2. Thoroughly analyze the inputs before deciding on actions or outputs
3. Justify your decisions within the <thinking> section
4. Only initiate relevant actions and outputs based on the given context
5. Maintain a logical flow in your response
6. Learn from previous results to improve future decisions
7. Evaluate the effectiveness of previous actions and outputs
8. Maintain consistency with successful patterns
9. Adapt strategy based on failed actions
10. Consider all historical context when making decisions

Your response should be comprehensive yet concise, demonstrating a clear understanding of the task and the ability to make informed decisions based on the provided information.`;

export async function chainOfThought({
    model,
    plan,
    actions,
    inputs,
    outputs,
    logs,
}: COTProps): Promise<COTResponse> {
    const prompt = render(promptTemplate, {
        plan,
        actions: actions.map(formatAction).join("\n"),
        logs: logs
            .map((i) => {
                switch (i.ref) {
                    case "input":
                        return formatInput(i);
                    case "output":
                        return formatOutput(i);
                    case "thought":
                        return formatXml({
                            tag: "thinking",
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
                            params: { callId: i.callId },
                            content: JSON.stringify(i.data),
                        });
                    default:
                        return null;
                }
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
        prompt: prompt + "\n<think>",
        stopSequences: ["</response>"],
    });

    const now = Date.now();

    const msg = response.messages[0];

    let text =
        msg.role === "assistant"
            ? Array.isArray(msg.content)
                ? msg.content
                      .map((t) => (t.type === "text" ? t.text : ""))
                      .join("\n")
                : msg.content
            : "";

    text = "<think>" + text;

    console.log(text);

    // todo: get this ordered for better outputs

    const plans = Array.from(text.matchAll(createTagRegex("plan"))).map(
        (t) => t[2]
    );

    const thinking = Array.from(
        text.matchAll(createTagRegex("think"))
    ).map<Thought>((t) => ({ ref: "thought", content: t[2], timestamp: now }));

    const outs = Array.from(
        text.matchAll(createTagRegex("output"))
    ).map<OutputRef>((t) => {
        const { name } = parseParams(t[1]);
        return { ref: "output", type: name, data: t[2], timestamp: now };
    });

    // todo: try catch json parse and repeat?
    const calls = Array.from(
        text.matchAll(createTagRegex("action"))
    ).map<ActionCall>((t) => {
        const { name } = parseParams(t[1]);
        return {
            ref: "action_call",
            id: randomUUID(),
            name,
            data: JSON.parse(t[2]),
            timestamp: now,
        };
    });

    // console.dir({ outputs: outs, actions: calls }, { depth: Infinity });

    return {
        plan: plans,
        actions: calls,
        outputs: outs,
        thinking,
    };
}
