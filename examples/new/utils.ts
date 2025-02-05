import { TemplateVariables } from "./types";

export function render<Template extends string>(
    str: Template,
    data: TemplateVariables<Template>
) {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) =>
        formatValue(data[key] ?? "")
    );
}

export function formatValue(value: any) {
    if (Array.isArray(value))
        return value.map((t) => formatValue(t)).join("\n");
    if (typeof value !== "string") return JSON.stringify(value);
    return value;
}
