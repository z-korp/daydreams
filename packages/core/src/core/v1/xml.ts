import type { XMLElement } from "./types";

export function formatXml({ tag, params, content }: XMLElement): string {
  const p = params
    ? Object.entries(params)
        .map(([k, v]) => ` ${k}="${v}"`)
        .join("")
    : "";
  try {
    return `<${tag}${p}>${typeof content === "string" ? content : content.map((el) => (typeof el === "string" ? el : formatXml(el))).join("\n")}</${tag}>`;
  } catch (error) {
    console.log("failed to format", { tag, params, content });
    throw error;
  }
}

export function createTagRegex(tagName: string) {
  return new RegExp(
    `(<${tagName}(?:\\s+[^>]*)?>)([\\s\\S]*?)<\/${tagName}>`,
    "gs"
  );
}

export function createTagParser<T = string>(
  tagName: string,
  contentParser?: (content: any) => T
) {
  const regex = createTagRegex(tagName);

  return (content: string) => {
    const matches = Array.from(content.matchAll(regex));
    try {
      return matches.map((t) => ({
        tag: tagName,
        params: t[1] ? parseParams(t[1]) : {},
        content: (contentParser
          ? contentParser(t[2]?.trim())
          : t[2]?.trim()) as T extends string ? string : T,
      }));
    } catch (error) {
      console.log({ content, matches });
      throw error;
    }
  };
}

export function parseParams(data: string) {
  const attrs: Record<string, string> = {};
  const matches = data.matchAll(/(\w+)="([^"]*)"/g);
  for (const match of matches) {
    attrs[match[1]] = match[2];
  }

  return attrs;
}
