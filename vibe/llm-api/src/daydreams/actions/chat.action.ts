import { action } from "@daydreamsai/core";
import { z } from "zod";
import { ChatMessage } from "../context/chat.context.js";

export const addToChatHistory = action({
  name: "chat:addMessage",
  description: "Add a message to the chat history",
  schema: z.object({
    content: z.string().min(1, "Content cannot be empty"),
    role: z.enum(["user", "assistant"]),
  }),
  handler: (call: any, ctx: any) => {
    // Adaptation pour gérer les différentes structures possibles de call
    let content, role;

    if (call.data) {
      // Si call a la propriété data, utilise-la directement
      content = call.data.content;
      role = call.data.role;
    } else {
      // Sinon, on suppose que content et role sont des propriétés directes
      content = call.content;
      role = call.role;
    }

    // Create a new message with timestamp
    const message: ChatMessage = {
      content,
      role,
      timestamp: Date.now(),
    };

    // Update the chat context memory
    ctx.memory.history = ctx.memory.history || [];
    ctx.memory.history.push(message);
    ctx.memory.lastActive = Date.now();
    ctx.memory.messageCount = (ctx.memory.messageCount || 0) + 1;

    return { success: true, message };
  },
});

export const clearChatHistory = action({
  name: "chat:clear",
  description: "Clear the chat history",
  schema: z.object({}),
  handler: (call: any, ctx: any) => {
    // Clear the chat history
    ctx.memory.history = [];
    ctx.memory.messageCount = 0;
    ctx.memory.lastActive = Date.now();

    return { success: true };
  },
});
