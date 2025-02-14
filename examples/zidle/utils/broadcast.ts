import { WebSocketServer, WebSocket } from "ws";
import {
  createMessage,
  AppMessage,
  UserChatMessage,
  WelcomeMessage,
  ResponseMessage,
  ErrorMessage,
  ThinkingStartMessage,
  ThinkingEndMessage,
  GoalCreatedMessage,
  GoalUpdatedMessage,
  GoalCompletedMessage,
  GoalFailedMessage,
  ActionStartMessage,
  ActionCompleteMessage,
  ActionErrorMessage,
  SystemMessage,
} from "../types/messages";

// We wrap all our broadcast functions into a factory function so we can pass in the WebSocket server.
export function setupBroadcastFunctions(wss: WebSocketServer) {
  // Helper: Broadcast a message to all connected clients
  function broadcastMessage(message: AppMessage) {
    const messageString = JSON.stringify(message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  // Broadcast a user chat message
  function broadcastUserChat(message: string) {
    const userChatMsg: UserChatMessage = {
      type: "user_chat",
      message,
      timestamp: "", // Will be filled by createMessage
      emoji: "",     // Will be filled by createMessage
    };
    broadcastMessage(createMessage(userChatMsg));
  }

  // Broadcast a welcome message
  function broadcastWelcome(message: string) {
    const welcomeMsg: WelcomeMessage = {
      type: "welcome",
      message,
      timestamp: "",
      emoji: "",
    };
    broadcastMessage(createMessage(welcomeMsg));
  }

  // Broadcast a response message
  function broadcastResponse(message: string) {
    const responseMsg: ResponseMessage = {
      type: "response",
      message,
      timestamp: "",
      emoji: "",
    };
    broadcastMessage(createMessage(responseMsg));
  }

  // Broadcast an error message
  function broadcastError(error: string) {
    const errorMsg: ErrorMessage = {
      type: "error",
      error,
      timestamp: "",
      emoji: "",
    };
    broadcastMessage(createMessage(errorMsg));
  }

  // Broadcast a "thinking_start" message
  function broadcastThinkingStart(message: string) {
    const thinkingStartMsg: ThinkingStartMessage = {
      type: "thinking_start",
      message,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      emoji: "🤔",
    };
    broadcastMessage(thinkingStartMsg);
  }

  // Broadcast a "thinking_end" message
  function broadcastThinkingEnd() {
    const thinkingEndMsg: ThinkingEndMessage = {
      type: "thinking_end",
      message: "Agent finished thinking.",
      timestamp: Math.floor(Date.now() / 1000).toString(),
      emoji: "✅",
    };
    broadcastMessage(thinkingEndMsg);
  }

  // Broadcast a goal created message
  function broadcastGoalCreated(id: string, description: string, priority: number, horizon: string) {
    const goalCreatedMsg: Omit<GoalCreatedMessage, "timestamp" | "emoji"> = {
      type: "goal_created",
      data: {
        id,
        description,
        priority,
        horizon,
        timestamp: Math.floor(Date.now() / 1000).toString(),
      },
    };
    broadcastMessage(createMessage(goalCreatedMsg));
  }

  // Broadcast a goal updated message
  function broadcastGoalUpdated(id: string, status: string) {
    const goalUpdatedMsg: Omit<GoalUpdatedMessage, "timestamp" | "emoji"> = {
      type: "goal_updated",
      data: {
        id,
        status,
        timestamp: Math.floor(Date.now() / 1000).toString(),
      },
    };
    broadcastMessage(createMessage(goalUpdatedMsg));
  }

  // Broadcast a goal completed message
  function broadcastGoalCompleted(id: string, result: string, description: string) {
    const goalCompletedMsg: Omit<GoalCompletedMessage, "timestamp" | "emoji"> = {
      type: "goal_completed",
      data: {
        id,
        result,
        description,
        timestamp: Math.floor(Date.now() / 1000).toString(),
      },
    };
    broadcastMessage(createMessage(goalCompletedMsg));
  }

  // Broadcast a goal failed message
  function broadcastGoalFailed(id: string, error: string) {
    const goalFailedMsg: Omit<GoalFailedMessage, "timestamp" | "emoji"> = {
      type: "goal_failed",
      data: {
        id,
        error,
        timestamp: Math.floor(Date.now() / 1000).toString(),
      },
    };
    broadcastMessage(createMessage(goalFailedMsg));
  }

  // Broadcast an action start message
  function broadcastActionStart(actionType: string, payload: any) {
    const actionStartMsg: Omit<ActionStartMessage, "timestamp" | "emoji"> = {
      type: "action_start",
      data: {
        actionType,
        payload,
      },
    };
    broadcastMessage(createMessage(actionStartMsg));
  }

  // Broadcast an action complete message
  function broadcastActionComplete(actionType: string, result: any) {
    const actionCompleteMsg: Omit<ActionCompleteMessage, "timestamp" | "emoji"> = {
      type: "action_complete",
      data: {
        actionType,
        result,
        timestamp: Math.floor(Date.now() / 1000).toString(),
      },
    };
    broadcastMessage(createMessage(actionCompleteMsg));
  }

  // Broadcast an action error message
  function broadcastActionError(actionType: string, error: string) {
    const actionErrorMsg: Omit<ActionErrorMessage, "timestamp" | "emoji"> = {
      type: "action_error",
      data: {
        actionType,
        error,
        timestamp: Math.floor(Date.now() / 1000).toString(),
      },
    };
    broadcastMessage(createMessage(actionErrorMsg));
  }

  // Broadcast a system message
  function broadcastSystemMessage(message: string) {
    const systemMsg: SystemMessage = {
      type: "system",
      message,
      timestamp: "",
      emoji: "",
    };
    broadcastMessage(createMessage(systemMsg));
  }

  return {
    broadcastMessage,
    broadcastUserChat,
    broadcastWelcome,
    broadcastResponse,
    broadcastError,
    broadcastThinkingStart,
    broadcastThinkingEnd,
    broadcastGoalCreated,
    broadcastGoalUpdated,
    broadcastGoalCompleted,
    broadcastGoalFailed,
    broadcastActionStart,
    broadcastActionComplete,
    broadcastActionError,
    broadcastSystemMessage,
  };
}