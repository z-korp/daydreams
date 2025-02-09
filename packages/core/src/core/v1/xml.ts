import type { XMLElement } from "./types";

/**
 * Formats an XML element into a string representation
 * @param tag - The XML tag name
 * @param params - Optional parameters/attributes for the XML tag
 * @param content - The content of the XML element (string or nested elements)
 * @returns Formatted XML string
 */
export function formatXml({ tag, params, content }: XMLElement): string {
    const p = params
        ? Object.entries(params)
            .map(([k, v]) => ` ${k}="${v}"`)
            .join("")
        : "";

    return `<${tag}${p}>${typeof content === "string" ? content : content.map((el) => (typeof el === "string" ? el : formatXml(el))).join("\n")}</${tag}>`;
}

/**
 * Creates a regular expression to match XML tags with a specific name
 * @param tagName - The name of the XML tag to match
 * @returns RegExp that matches the specified XML tag and captures its attributes and content
 */
export function createTagRegex(tagName: string) {
    return new RegExp(
        `(<${tagName}(?:\\s+[^>]*)?>)([\\s\\S]*?)<\/${tagName}>`,
        "gs"
    );
}

/**
 * Parses XML tag attributes into a key-value object
 * @param data - The XML tag opening including attributes (e.g. '<tag attr1="val1" attr2="val2">')
 * @returns Object containing parsed attribute key-value pairs
 */
export function parseParams(data: string) {
    const attrs: Record<string, string> = {};
    const matches = data.matchAll(/(\w+)="([^"]*)"/g);
    for (const match of matches) {
        attrs[match[1]] = match[2];
    }

    return attrs;
}
