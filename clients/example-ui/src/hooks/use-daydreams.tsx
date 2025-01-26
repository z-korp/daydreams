
import { useEffect, useRef, useState } from "react";

interface ServerMessage {
  type: string;
  message?: string;
  error?: string;
}

export function useDaydreamsWs() {
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Connected to Daydreams WebSocket!");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ServerMessage;
        setMessages((prev) => [...prev, data]);
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

  const sendGoal = (goal: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not open. Cannot send goal:", goal);
      return;
    }

    setMessages((prev) => [...prev, { type: "user", message: goal }]);

    wsRef.current.send(JSON.stringify({ goal }));
  };

  return {
    messages,
    sendGoal,
  };
}
