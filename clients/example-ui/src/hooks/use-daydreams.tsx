import { useEffect, useRef, useState } from "react";

interface ServerMessage {
  type: string;
  message?: string;
  error?: string;
  orchestrators?: Array<{
    id: string;
    name: string;
  }>;
  orchestratorId?: string;
  content?: string;
  messageType?: string;
  timestamp?: number;
}

export function useDaydreamsWs() {
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8080";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`✅ Connected to Daydreams WebSocket at ${wsUrl}!`);
    };

    ws.onmessage = (event) => {
      try {
        setLastMessage(event.data);
        const data = JSON.parse(event.data) as ServerMessage;
        
        if (data.type !== "message") {
          setMessages((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", event.data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("❌ Disconnected from Daydreams WebSocket.");
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (message: unknown) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not open. Cannot send message:", message);
      return;
    }

    wsRef.current.send(JSON.stringify(message));
  };

  return {
    messages,
    lastMessage,
    sendMessage,
  };
}
