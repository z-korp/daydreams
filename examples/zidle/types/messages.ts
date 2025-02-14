export type MessageType =
  | "welcome"
  | "response"
  | "error"
  | "goal_created"
  | "goal_updated"
  | "goal_completed"
  | "goal_failed"
  | "action_start"
  | "action_complete"
  | "action_error"
  | "system"
  | "thinking_start"
  | "thinking_end"
  | "user_chat";

export interface BaseMessage {
  type: MessageType;
  timestamp: string; // ISO string or a Unix timestamp in string format
  emoji?: string;
}

export interface UserChatMessage extends BaseMessage {
  type: "user_chat";
  message: string;
}

export interface ThinkingStartMessage extends BaseMessage {
  type: "thinking_start";
  message: string;
}

export interface ThinkingEndMessage extends BaseMessage {
  type: "thinking_end";
  message: string;
}

export interface WelcomeMessage extends BaseMessage {
  type: "welcome";
  message: string;
}

export interface ResponseMessage extends BaseMessage {
  type: "response";
  message: string;
}

export interface ErrorMessage extends BaseMessage {
  type: "error";
  error: string;
}

export interface GoalCreatedMessage extends BaseMessage {
  type: "goal_created";
  data: {
    id: string;
    description: string;
    timestamp: string;
    priority: number;
    horizon: string;
  };
}

export interface GoalUpdatedMessage extends BaseMessage {
  type: "goal_updated";
  data: {
    id: string;
    status: string;
    timestamp: string;
  };
}

export interface GoalCompletedMessage extends BaseMessage {
  type: "goal_completed";
  data: {
    id: string;
    result: string;
    description: string;
    timestamp: string;
  };
}

export interface GoalFailedMessage extends BaseMessage {
  type: "goal_failed";
  data: {
    id: string;
    error: string;
    timestamp: string;
  };
}

export interface ActionStartMessage extends BaseMessage {
  type: "action_start";
  data: {
    actionType: string;
    payload: any;
  };
}

export interface ActionCompleteMessage extends BaseMessage {
  type: "action_complete";
  data: {
    actionType: string;
    result: any;
    timestamp: string;
  };
}

export interface ActionErrorMessage extends BaseMessage {
  type: "action_error";
  data: {
    actionType: string;
    error: string;
    timestamp: string;
  };
}

export interface SystemMessage extends BaseMessage {
  type: "system";
  message: string;
}

// Union Type for All Messages
export type AppMessage =
  | WelcomeMessage
  | ResponseMessage
  | ErrorMessage
  | GoalCreatedMessage
  | GoalUpdatedMessage
  | GoalCompletedMessage
  | GoalFailedMessage
  | ActionStartMessage
  | ActionCompleteMessage
  | ActionErrorMessage
  | SystemMessage
  | ThinkingStartMessage
  | ThinkingEndMessage
  | UserChatMessage;

const emojiMap: Record<MessageType, string> = {
  welcome: "👋",
  response: "💬",
  error: "❌",
  goal_created: "🎯",
  goal_updated: "📝",
  goal_completed: "✅",
  goal_failed: "❌",
  action_start: "🚀",
  action_complete: "✅",
  action_error: "❌",
  system: "🛠️",
  user_chat: "",
  thinking_start: "💬",
  thinking_end: "✅",
};

export function createMessage<M extends BaseMessage>(
  message: Omit<M, "timestamp" | "emoji">
): M {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const emoji = emojiMap[message.type];

  return {
    ...message,
    timestamp,
    emoji,
  } as M;
}