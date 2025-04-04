import { context } from '@daydreamsai/core';
import { z } from 'zod';

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
};

export interface ChatMetadata {
  title?: string;
  tags?: string[];
  createdAt: number;
  lastActive: number;
  messageCount: number;
}

export const chatContext = context({
  type: "chat-session",
  schema: z.object({
    sessionId: z.string().describe("Unique identifier for this chat session"),
    title: z.string().optional().describe("Optional title for this chat session"),
    tags: z.array(z.string()).optional().describe("Optional tags for categorization"),
  }),
  key( params) { 
    const sessionId = params?.sessionId || 'default';
    return `chat:${sessionId}`; 
  },
  create({ title = "New Chat", tags = [] }) {
    const now = Date.now();
    return {
      // Chat history
      history: [] as ChatMessage[],
      
      // Metadata
      title,
      tags,
      createdAt: now,
      lastActive: now,
      messageCount: 0,
      
      // State flags
      isActive: true,
    };
  },
  render({ memory }) {
    // Format chat history for the LLM
    const formattedHistory = memory.history && memory.history.length > 0
      ? memory.history.map((m: ChatMessage) => 
          `${m.role.toUpperCase()}: ${m.content}`
        ).join('\n\n')
      : 'No conversation history yet.';
      
    // Create a helpful header
    const header = `
# Chat Session: ${memory.title || 'Untitled'}
${memory.tags?.length ? `Tags: ${memory.tags.join(', ')}` : ''}
Messages: ${memory.messageCount || 0}
Last Active: ${new Date(memory.lastActive).toLocaleString()}

## Conversation History:
`;
    
    return header + formattedHistory;
  },
});
