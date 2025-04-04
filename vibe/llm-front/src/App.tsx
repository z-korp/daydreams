import { useState, useEffect, useRef } from "react";
import "./App.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Récupérer l'URL de l'API depuis les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(
    "session-" + Math.random().toString(36).substring(2, 9)
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to state
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput("");

    try {
      // Send request to API
      const response = await fetch(`${API_URL}/llm/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          prompt: input,
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Extraire le contenu de la réponse imbriquée et nettoyer les balises XML
      let content = "";

      if (data.response && data.response.content) {
        // Nettoyer les balises XML si présentes
        content = data.response.content.replace(/<\/?content>/g, "");
      } else if (data.content) {
        // Format original
        content = data.content;
      } else {
        // Fallback
        content = "Réponse reçue mais format inattendu";
      }

      // Add response to messages
      const assistantMessage: Message = {
        role: "assistant",
        content: content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Désolé, une erreur est survenue lors de la communication avec l'assistant.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Vibe Chat</h1>
        <div className="session-info">Session: {sessionId}</div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            Envoyez un message pour démarrer la conversation
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-content">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message assistant loading">
            <div className="loading-indicator">...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre message ici..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          Envoyer
        </button>
      </div>
    </div>
  );
}

export default App;
