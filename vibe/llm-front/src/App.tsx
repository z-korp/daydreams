import { useState, useEffect, useRef } from "react";
import "./App.css";

// Define more specific interfaces for the API response structure
interface ResponseItem {
  id: string;
  ref: string;
  type: string;
  name?: string;
  data?: Record<string, unknown>;
  content?: string;
  prompt?: string;
  response?: string;
  processed?: boolean;
  timestamp?: number;
  step?: number;
  formatted?: Record<string, unknown>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  rawResponse?: ResponseItem[]; // Store raw response for filtering
  activeFilter?: string; // Store active filter
  showDetails?: boolean; // Added for show/hide details functionality
}

// Récupérer l'URL de l'API depuis les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(
    "session-" + Math.random().toString(36).substring(2, 9)
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // List of possible filters based on the response structure
  const filters = [
    { id: "all", label: "All" },
    { id: "input", label: "Inputs" },
    { id: "output", label: "Outputs" },
    { id: "step", label: "Steps" },
    { id: "run", label: "Runs" },
    { id: "thought", label: "Thoughts" },
    { id: "action_call", label: "Action Calls" },
    { id: "action_result", label: "Action Results" },
  ];

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

      // Process the complex response structure
      let content = "";
      let rawResponse: ResponseItem[] = [];

      // Try to extract the actual response array
      if (Array.isArray(data.response)) {
        rawResponse = data.response;
        // Find the output elements to display in the main content
        const outputs = data.response.filter(
          (item: ResponseItem) =>
            item.ref === "output" ||
            (item.ref === "step" && item.data?.response)
        );

        if (outputs.length > 0) {
          // Prioritize actual output content
          const output = outputs[outputs.length - 1];
          content =
            output.content || output.data?.response || JSON.stringify(output);
        } else {
          // If no outputs, use the last item in the response
          const lastItem = data.response[data.response.length - 1];
          content =
            lastItem.content ||
            lastItem.data?.response ||
            "No direct output found in response.";
        }
      } else if (data.response && typeof data.response === "object") {
        // Handle when response is a single object
        rawResponse = [data.response];
        content = data.response.content || JSON.stringify(data.response);
      } else if (data.content) {
        // Handle original format
        content = data.content;
      } else {
        content =
          "Response received but cannot parse format. Check console for details.";
      }

      // Add response to messages
      const assistantMessage: Message = {
        role: "assistant",
        content: content,
        timestamp: Date.now(),
        rawResponse: rawResponse,
        activeFilter: "all",
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

  // Format an individual response item for display
  const formatResponseItem = (item: ResponseItem) => {
    let content = "";

    if (item.ref === "input" || item.ref === "output") {
      content = item.content || JSON.stringify(item.data);
    } else if (item.ref === "step") {
      content = `Step ${item.step}: ${item.data?.prompt || ""}\n\nResponse: ${item.data?.response || ""}`;
    } else if (item.ref === "thought") {
      content = item.content || "";
    } else if (item.ref === "run") {
      content = `Run: ${item.type}`;
    } else if (item.ref === "action_call") {
      content = `Action Call: ${item.name} - ${item.content}`;
    } else if (item.ref === "action_result") {
      content = `Action Result: ${item.name} - ${JSON.stringify(item.data)}`;
    } else {
      content = JSON.stringify(item);
    }

    return (
      <div key={item.id} className="response-item">
        <div className="response-item-header">
          <span className="response-item-type">{item.ref}</span>
          <span className="response-item-id">{item.id.substring(0, 8)}...</span>
        </div>
        <div className="response-item-content">
          <pre>{content}</pre>
        </div>
        {item.timestamp && (
          <div className="response-item-time">
            {new Date(item.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  };

  // Handle filter selection
  const handleFilterChange = (filter: string, messageIndex: number) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages[messageIndex]) {
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          activeFilter: filter,
        };
      }
      return newMessages;
    });
  };

  // Render the filtered response items
  const renderFilteredResponse = (message: Message, messageIndex: number) => {
    if (!message.rawResponse) return null;

    const filter = message.activeFilter || "all";

    const filteredItems =
      filter === "all"
        ? message.rawResponse
        : message.rawResponse.filter((item) => item.ref === filter);

    return (
      <div className="response-details">
        <div className="filter-controls">
          {filters.map((f) => (
            <button
              key={f.id}
              className={`filter-button ${message.activeFilter === f.id ? "active" : ""}`}
              onClick={() => handleFilterChange(f.id, messageIndex)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="filtered-items">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => formatResponseItem(item))
          ) : (
            <div className="no-items">Aucun élément de ce type trouvé</div>
          )}
        </div>
      </div>
    );
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

              {msg.role === "assistant" && msg.rawResponse && (
                <button
                  className="toggle-details-button"
                  onClick={() => {
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      newMessages[index] = {
                        ...newMessages[index],
                        showDetails: !newMessages[index].showDetails,
                      };
                      return newMessages;
                    });
                  }}
                >
                  {msg.showDetails
                    ? "Masquer les détails"
                    : "Afficher les détails"}
                </button>
              )}

              {msg.role === "assistant" &&
                msg.rawResponse &&
                msg.showDetails &&
                renderFilteredResponse(msg, index)}
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
