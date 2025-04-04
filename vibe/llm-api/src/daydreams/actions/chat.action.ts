import { action } from '@daydreamsai/core';
import { z } from 'zod';
import { ChatMessage } from '../context/chat.context';

export const addToChatHistory = action({
  name: "addToChatHistory",
  description: "Adds a new message to the chat history and maintains conversation state",
  schema: z.object({
    role: z.enum(["user", "assistant"]).describe("Who is sending this message (user or assistant)"),
    content: z.string().describe("The actual message content to be added to the history"),
  }),
  handler(call, ctx) {
    try {
      // Utiliser ctx.agentMemory au lieu de ctx.memory
      const memory = ctx.agentMemory as any;
      
      // Initialize history array if it doesn't exist
      if (!Array.isArray(memory.history)) {
        memory.history = [];
      }
      
      // Create a well-structured message object
      const newMessage: ChatMessage = {
        role: call.role,
        content: call.content,
        timestamp: Date.now()
      };
      
      // Add message to history
      memory.history.push(newMessage);
      
      // Update session metadata
      memory.lastActive = Date.now();
      memory.messageCount = (memory.messageCount || 0) + 1;
      
      return { 
        success: true,
        messageId: memory.messageCount,
        message: `Successfully added ${call.role} message to chat history`
      };
    } catch (error) {
      console.error('Error adding message to chat history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to add message to chat history'
      };
    }
  },
});

// Additional actions for chat functionality
export const clearChatHistory = action({
  name: "clearChatHistory",
  description: "Clears the entire chat history for the current session",
  schema: z.object({}),
  handler(call, ctx) {
    try {
      const memory = ctx.memory;
      
      // Store the count for reference
      const previousCount = memory.history?.length || 0;
      
      // Reset the history
      memory.history = [];
      memory.lastActive = Date.now();
      memory.messageCount = 0;
      
      return {
        success: true,
        clearedMessages: previousCount,
        message: `Chat history cleared. Removed ${previousCount} messages.`
      };
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to clear chat history'
      };
    }
  },
});
