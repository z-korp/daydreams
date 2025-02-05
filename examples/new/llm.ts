import { generateText, LanguageModelV1 } from "ai";

export async function llm({
    model,
    system,
    prompt,
    stopSequences,
}: {
    model: LanguageModelV1;
    system?: string;
    prompt?: string;
    stopSequences?: string[];
}) {
    const response = await generateText({
        model,
        system,
        prompt,
        stopSequences,
    });

    return response;
}
