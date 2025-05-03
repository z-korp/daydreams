/**
 * Core Adapter
 * Fournit des fonctions d'adaptation pour @daydreamsai/core
 */

import { z } from "zod";

// Exportations du module @daydreamsai/core
export { createDreams, LogLevel } from "@daydreamsai/core";

// Action - helper d'adaptation
export function action(options: any) {
  return options;
}

// Context - helper d'adaptation
export function context(options: any) {
  return options;
}

// Input - helper d'adaptation
export function input(options: any) {
  return options;
}

// Output - helper d'adaptation
export function output(options: any) {
  return options;
}

// Formattage de message
export function formatMsg(
  message: string | Record<string, any>,
  ...args: any[]
) {
  if (typeof message === "string") {
    return message.replace(
      /\{(\d+)\}/g,
      (match, index) => args[parseInt(index)] || match
    );
  }

  if (typeof message === "object" && message !== null) {
    const { role, content } = message;
    if (role && content) {
      return `${role.toUpperCase()}: ${content}`;
    }
  }

  return "";
}

// Classe de réponse
export class OutputResponse {
  constructor(public content: string) {}
}
