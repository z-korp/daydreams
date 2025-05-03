import { useState, useEffect, useRef, useCallback } from "react";
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

interface Session {
  id: string;
  name: string;
  createdAt: number;
}

// Définition des interfaces pour les agents
interface AgentConfig {
  id: string;
  modelType: string;
  modelId: string;
  contexts: string[];
  contextArgs: Record<string, Record<string, unknown>>;
}

interface Agent {
  id: string;
  config: AgentConfig;
}

// Récupérer l'URL de l'API depuis les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Nouveaux états pour la gestion d'agents
  const [agents, setAgents] = useState<Agent[]>([]);
  const [availableContexts, setAvailableContexts] = useState<string[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [showAgentDialog, setShowAgentDialog] = useState(false);
  const [newAgentContexts, setNewAgentContexts] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

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

  // Add a reference for the response details
  const responseDetailsRefs = useRef<{ [key: number]: HTMLDivElement | null }>(
    {}
  );

  // Initialize or load existing sessions on mount
  useEffect(() => {
    loadSessions();
    loadAgentsAndContexts();
  }, []);

  // Load sessions from localStorage
  const loadSessions = () => {
    const savedSessions = localStorage.getItem("chatSessions");
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);

      // If we have a recent session, select it
      const lastSessionId = localStorage.getItem("lastSessionId");
      if (lastSessionId) {
        const lastSession = parsedSessions.find(
          (s: Session) => s.id === lastSessionId
        );
        if (lastSession) {
          setSelectedSession(lastSession);
          loadSessionMessages(lastSession.id);
        }
      }
    }
  };

  // Save sessions to localStorage
  const saveSessions = (updatedSessions: Session[]) => {
    localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
    setSessions(updatedSessions);
  };

  // Create a new session
  const createNewSession = () => {
    if (!newSessionName.trim()) {
      setNewSessionName(`Salon ${sessions.length + 1}`);
    }

    const sessionId = "session-" + Math.random().toString(36).substring(2, 9);
    const newSession: Session = {
      id: sessionId,
      name: newSessionName.trim() || `Salon ${sessions.length + 1}`,
      createdAt: Date.now(),
    };

    const updatedSessions = [...sessions, newSession];
    saveSessions(updatedSessions);
    setSelectedSession(newSession);
    setMessages([]);
    localStorage.setItem("lastSessionId", sessionId);
    localStorage.setItem(`messages-${sessionId}`, JSON.stringify([]));

    setShowNewSessionForm(false);
    setNewSessionName("");
  };

  // Switch to a different session
  const switchSession = (session: Session) => {
    setSelectedSession(session);
    localStorage.setItem("lastSessionId", session.id);
    loadSessionMessages(session.id);
  };

  // Load messages for a specific session
  const loadSessionMessages = (sessionId: string) => {
    const savedMessages = localStorage.getItem(`messages-${sessionId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([]);
    }
  };

  // Save messages for the current session
  const saveSessionMessages = (newMessages: Message[]) => {
    if (selectedSession) {
      localStorage.setItem(
        `messages-${selectedSession.id}`,
        JSON.stringify(newMessages)
      );
    }
  };

  // Delete a session
  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent switching to the session when deleting

    const updatedSessions = sessions.filter((s) => s.id !== sessionId);
    saveSessions(updatedSessions);

    // Remove session messages
    localStorage.removeItem(`messages-${sessionId}`);

    // If we deleted the selected session, select another one or clear
    if (selectedSession && selectedSession.id === sessionId) {
      if (updatedSessions.length > 0) {
        const newSelected = updatedSessions[0];
        setSelectedSession(newSelected);
        localStorage.setItem("lastSessionId", newSelected.id);
        loadSessionMessages(newSelected.id);
      } else {
        setSelectedSession(null);
        localStorage.removeItem("lastSessionId");
        setMessages([]);
      }
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fonction pour charger les agents et les contextes disponibles
  const loadAgentsAndContexts = async () => {
    setLoadingAgents(true);
    try {
      // Charger les contextes disponibles
      const contextsResponse = await fetch(`${API_URL}/daydreams/contexts`);
      if (contextsResponse.ok) {
        const data = await contextsResponse.json();
        setAvailableContexts(data.contexts || []);
      }

      // Charger les agents
      const agentsResponse = await fetch(`${API_URL}/daydreams/agents`);
      if (agentsResponse.ok) {
        const data = await agentsResponse.json();
        setAgents(data.agents || []);

        // Sélectionner le premier agent par défaut s'il existe
        if (data.agents && data.agents.length > 0) {
          setSelectedAgent(data.agents[0]);
        }
      }
    } catch (error) {
      console.error("Error loading agents and contexts:", error);
    } finally {
      setLoadingAgents(false);
    }
  };

  // Fonction pour créer un nouvel agent
  const createNewAgent = async () => {
    try {
      const agentId = `agent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const contextArgs: Record<string, Record<string, unknown>> = {};

      // Initialiser les arguments par défaut pour chaque contexte
      newAgentContexts.forEach((contextId) => {
        if (contextId === "chat") {
          contextArgs[contextId] = {
            sessionId: `session-${Date.now()}`,
            userId: "user",
          };
        } else {
          contextArgs[contextId] = {};
        }
      });

      const newAgent = {
        id: agentId,
        modelType: "anthropic", // Valeur par défaut
        modelId: "claude-3-7-sonnet-latest", // Valeur par défaut
        contexts: newAgentContexts,
        contextArgs: contextArgs,
      };

      const response = await fetch(`${API_URL}/daydreams/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAgent),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Agent created successfully:", result);
        setShowAgentDialog(false);
        setNewAgentContexts([]);
        // Recharger la liste des agents
        loadAgentsAndContexts();
      } else {
        console.error("Failed to create agent:", await response.json());
      }
    } catch (error) {
      console.error("Error creating agent:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent) return;

    // Make sure we have a session
    if (!selectedSession) {
      // Create a default session if none exists
      const sessionId = "session-" + Math.random().toString(36).substring(2, 9);
      const newSession: Session = {
        id: sessionId,
        name: `Salon ${sessions.length + 1}`,
        createdAt: Date.now(),
      };

      const updatedSessions = [...sessions, newSession];
      saveSessions(updatedSessions);
      setSelectedSession(newSession);
      localStorage.setItem("lastSessionId", sessionId);
    }

    // Add user message to state
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveSessionMessages(updatedMessages);

    setLoading(true);
    setInput("");

    try {
      // Envoyer la requête à l'agent spécifique
      const response = await fetch(
        `${API_URL}/daydreams/agents/${selectedAgent.id}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Format attendu par le contrôleur
            contextId: selectedAgent.config.contexts[0],
            // Les paramètres requis par le schéma d'entrée
            message: input, // Pour compatibilité avec le contrôleur
            userId: "user", // Pour compatibilité avec le contrôleur

            // Modification pour que le contrôleur transmette les bons paramètres
            // Le contrôleur doit maintenant utiliser ces valeurs dans input.data
            input: {
              type: "chat",
              data: {
                sessionId: selectedSession?.id || `session-${Date.now()}`,
                prompt: input,
                userId: "user",
              },
            },
          }),
        }
      );

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
          if (output.content) {
            // Handle content that might be an object
            content =
              typeof output.content === "object"
                ? JSON.stringify(output.content)
                : output.content;
          } else if (output.data?.response) {
            // Handle response that might be an object
            content =
              typeof output.data.response === "object"
                ? JSON.stringify(output.data.response)
                : output.data.response;
          } else {
            content = JSON.stringify(output);
          }
        } else {
          // If no outputs, use the last item in the response
          const lastItem = data.response[data.response.length - 1];
          if (lastItem.content) {
            content =
              typeof lastItem.content === "object"
                ? JSON.stringify(lastItem.content)
                : lastItem.content;
          } else if (lastItem.data?.response) {
            content =
              typeof lastItem.data.response === "object"
                ? JSON.stringify(lastItem.data.response)
                : lastItem.data.response;
          } else {
            content = "No direct output found in response.";
          }
        }
      } else if (data.response && typeof data.response === "object") {
        // Handle when response is a single object
        rawResponse = [data.response];

        if (data.response.content) {
          content =
            typeof data.response.content === "object"
              ? JSON.stringify(data.response.content)
              : data.response.content;
        } else {
          content = JSON.stringify(data.response);
        }
      } else if (data.content) {
        // Handle original format
        content =
          typeof data.content === "object"
            ? JSON.stringify(data.content)
            : data.content;
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

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveSessionMessages(finalMessages);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Désolé, une erreur est survenue lors de la communication avec l'assistant.",
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveSessionMessages(finalMessages);
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
  const formatResponseItem = (item: ResponseItem, index: number) => {
    let content = "";

    if (item.ref === "input" || item.ref === "output") {
      // Convert content to string if it's an object
      if (typeof item.content === "object" && item.content !== null) {
        content = JSON.stringify(item.content, null, 2);
      } else {
        content = item.content || "";
      }

      // If we have data and no content, use the data
      if (!content && item.data) {
        content = JSON.stringify(item.data, null, 2);
      }
    } else if (item.ref === "step") {
      const prompt = item.data?.prompt
        ? typeof item.data.prompt === "object"
          ? JSON.stringify(item.data.prompt, null, 2)
          : item.data.prompt
        : "";

      const response = item.data?.response
        ? typeof item.data.response === "object"
          ? JSON.stringify(item.data.response, null, 2)
          : item.data.response
        : "";

      content = `Step ${item.step}: ${prompt}\n\nResponse: ${response}`;
    } else if (item.ref === "thought") {
      content =
        typeof item.content === "object"
          ? JSON.stringify(item.content, null, 2)
          : item.content || "";
    } else if (item.ref === "run") {
      content = `Run: ${item.type}`;
    } else if (item.ref === "action_call") {
      const actionContent =
        typeof item.content === "object"
          ? JSON.stringify(item.content, null, 2)
          : item.content || "";
      content = `Action Call: ${item.name || "Unnamed"} - ${actionContent}`;
    } else if (item.ref === "action_result") {
      content = `Action Result: ${item.name || "Unnamed"} - ${JSON.stringify(item.data, null, 2)}`;
    } else {
      content = JSON.stringify(item, null, 2);
    }

    // Create a unique key combining the item id and index
    const uniqueKey = `${item.id || index}-${index}`;

    return (
      <div key={uniqueKey} className="response-item">
        <div className="response-item-header">
          <span className="response-item-type">{item.ref}</span>
          <span className="response-item-id">
            {item.id ? item.id.substring(0, 8) + "..." : `item-${index}`}
          </span>
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
      <>
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
            filteredItems.map((item, index) => formatResponseItem(item, index))
          ) : (
            <div className="no-items">Aucun élément de ce type trouvé</div>
          )}
        </div>
      </>
    );
  };

  // Create a toggleDetails function with smooth scrolling
  const toggleDetails = useCallback((index: number) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      const showDetails = !newMessages[index].showDetails;

      newMessages[index] = {
        ...newMessages[index],
        showDetails,
      };

      // If showing details, scroll to them after a short delay to allow rendering
      if (showDetails) {
        setTimeout(() => {
          const detailsElement = responseDetailsRefs.current[index];
          if (detailsElement) {
            detailsElement.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }, 100);
      }

      return newMessages;
    });
  }, []);

  // Fix the message content display
  const processMessageContent = (content: string) => {
    // Check if the content is a JSON string and try to parse it
    if (content && typeof content === "string") {
      try {
        // Only try to parse if it looks like JSON
        if (
          (content.startsWith("{") && content.endsWith("}")) ||
          (content.startsWith("[") && content.endsWith("]"))
        ) {
          const parsed = JSON.parse(content);
          // If it's an object, format it nicely
          return (
            <pre className="formatted-content">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          );
        }
      } catch {
        // Not valid JSON, continue with original content
      }
    }

    // Regular string content - preserve line breaks
    return <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>;
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Salons</h2>
          <button
            onClick={() => setShowNewSessionForm(true)}
            className="new-session-button"
          >
            +
          </button>
        </div>

        {showNewSessionForm && (
          <div className="new-session-form">
            <input
              type="text"
              placeholder="Nom du salon"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createNewSession()}
            />
            <div className="form-buttons">
              <button onClick={createNewSession}>Créer</button>
              <button onClick={() => setShowNewSessionForm(false)}>
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="sessions-list">
          {sessions.length === 0 ? (
            <div className="no-sessions">Aucun salon</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${selectedSession?.id === session.id ? "active" : ""}`}
                onClick={() => switchSession(session)}
              >
                <span className="session-name">{session.name}</span>
                <span
                  className="delete-session"
                  onClick={(e) => deleteSession(session.id, e)}
                >
                  ×
                </span>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-header">
            <h2>Agents</h2>
            <button
              onClick={() => setShowAgentDialog(true)}
              className="new-session-button"
            >
              +
            </button>
          </div>

          <div className="agents-list">
            {loadingAgents ? (
              <div className="loading-info">Chargement...</div>
            ) : agents.length === 0 ? (
              <div className="no-agents">Aucun agent</div>
            ) : (
              agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`agent-item ${selectedAgent?.id === agent.id ? "active" : ""}`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <span className="agent-name">
                    Agent {agent.id.substring(0, 6)}...
                  </span>
                  <span className="agent-contexts">
                    {agent.config.contexts.join(", ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <h1>
            {selectedSession ? selectedSession.name : "Vibe Chat"}
            {selectedAgent &&
              ` - Agent: ${selectedAgent.id.substring(0, 6)}...`}
          </h1>
          <div className="session-info">
            {selectedSession && <>Session: {selectedSession.id}</>}
          </div>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              Envoyez un message pour démarrer la conversation
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-content">
                  {processMessageContent(msg.content)}
                </div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>

                {msg.role === "assistant" && msg.rawResponse && (
                  <button
                    className="toggle-details-button"
                    onClick={() => toggleDetails(index)}
                  >
                    {msg.showDetails
                      ? "Masquer les détails"
                      : "Afficher les détails"}
                  </button>
                )}

                {msg.role === "assistant" &&
                  msg.rawResponse &&
                  msg.showDetails && (
                    <div
                      className="response-details"
                      ref={(el) => {
                        responseDetailsRefs.current[index] = el;
                      }}
                    >
                      {renderFilteredResponse(msg, index)}
                    </div>
                  )}
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

      {/* Modal pour créer un nouvel agent */}
      {showAgentDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Créer un nouvel agent</h2>

            <div className="form-group">
              <label>Contextes disponibles:</label>
              <div className="context-checkboxes">
                {availableContexts.map((context) => (
                  <label key={context} className="context-checkbox">
                    <input
                      type="checkbox"
                      checked={newAgentContexts.includes(context)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewAgentContexts([...newAgentContexts, context]);
                        } else {
                          setNewAgentContexts(
                            newAgentContexts.filter((c) => c !== context)
                          );
                        }
                      }}
                    />
                    {context}
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-buttons">
              <button
                onClick={createNewAgent}
                disabled={newAgentContexts.length === 0}
              >
                Créer
              </button>
              <button onClick={() => setShowAgentDialog(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
