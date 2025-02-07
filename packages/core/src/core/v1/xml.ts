import type { XMLElement } from "./types";

export function formatXml({ tag, params, content }: XMLElement): string {
    const p = params
        ? Object.entries(params)
            .map(([k, v]) => ` ${k}="${v}"`)
            .join("")
        : "";

    return `<${tag}${p}>${typeof content === "string" ? content : content.map((el) => (typeof el === "string" ? el : formatXml(el))).join("\n")}</${tag}>`;
}

export function createTagRegex(tagName: string) {
    return new RegExp(
        `(<${tagName}(?:\\s+[^>]*)?>)([\\s\\S]*?)<\/${tagName}>`,
        "gs"
    );
}

export function parseParams(data: string) {
    const attrs: Record<string, string> = {};
    const matches = data.matchAll(/(\w+)="([^"]*)"/g);
    for (const match of matches) {
        attrs[match[1]] = match[2];
    }

    return attrs;
}
