import { useState, useEffect } from "react";
import { MessagesList } from "@/components/message-list";
import { useDaydreamsWs } from "@/hooks/use-daydreams";
import { useAppStore } from "@/store/use-app-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { ChangeEvent, KeyboardEvent } from 'react';

interface WelcomeMessage {
  type: 'welcome';
  orchestrators: Array<{
    id: string;
    name: string;
  }>;
}

interface ResponseMessage {
  type: 'response';
  message: string;
  orchestratorId: string;
}

interface UserMessage {
  type: 'user';
  message: string;
  orchestratorId: string;
}

interface DebugMessage extends Message {
  type: 'debug';
  messageType: string;
  timestamp: number;
  data?: any;
}

type Message = WelcomeMessage | ResponseMessage | UserMessage | DebugMessage;

interface Orchestrator {
  id: string;
  name: string;
}

// Ajout des types de messages pour le filtrage
const MESSAGE_TYPES = {
  STATE: 'state',
  WELCOME: 'welcome',
  USER: 'user',
  DEBUG: 'debug',
  RESPONSE: 'response'
} as const;

function DebugPanel({ messages, state }: { messages: Message[], state: AppState }) {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(Object.values(MESSAGE_TYPES)));
  
  const toggleMessageType = (type: string) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };

  const filteredMessages = messages.filter(msg => selectedTypes.has(msg.type));

  return (
    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/50 overflow-hidden max-h-[400px]">
      {/* État Zustand */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Zustand State</h3>
          <span className="text-xs text-muted-foreground">
            {Object.keys(state).length} properties
          </span>
        </div>
        <div className="h-[320px] overflow-auto rounded border border-border/50 bg-background/50 p-2">
          <pre className="text-xs">
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
      </div>

      {/* Messages de Debug */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Debug Messages</h3>
          <div className="flex gap-1">
            {Object.entries(MESSAGE_TYPES).map(([key, type]) => (
              <button
                key={type}
                onClick={() => toggleMessageType(type)}
                className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                  selectedTypes.has(type)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {key.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[320px] overflow-auto rounded border border-border/50 bg-background/50 p-2 space-y-2">
          {filteredMessages.map((msg, idx) => {
            let content = '';
            let badge = '';
            
            if (msg.type === 'debug') {
              const debugMsg = msg as DebugMessage;
              const time = new Date(debugMsg.timestamp).toLocaleTimeString();
              badge = debugMsg.messageType;
              content = debugMsg.data 
                ? JSON.stringify(debugMsg.data, null, 2)
                : debugMsg.message;
              return (
                <div key={idx} className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{time}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-medium">
                      {badge}
                    </span>
                  </div>
                  <div className="font-mono pl-2 border-l-2 border-muted">
                    {content}
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-medium">
                    {msg.type}
                  </span>
                </div>
                <div className="font-mono pl-2 border-l-2 border-muted">
                  {JSON.stringify(msg, null, 2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const [message, setMessage] = useState("");
  const [orchestrators, setOrchestrators] = useState<Orchestrator[]>([]);
  const { 
    currentOrchestratorId, 
    setCurrentOrchestratorId, 
    messages,
    getMessagesForCurrentOrchestrator,
    addMessage,
    showDebug,
    toggleShowDebug,
    theme,
    toggleTheme
  } = useAppStore();
  const { sendMessage } = useDaydreamsWs();
  const [showDebugInChat, setShowDebugInChat] = useState(false);

  // Filtrer les messages pour n'afficher que ceux de l'orchestrateur courant
  const filteredMessages = messages.filter(msg => {
    // Toujours afficher les messages système et les messages de l'orchestrateur courant
    const isRelevant = msg.orchestratorId === currentOrchestratorId || 
                      msg.type === 'welcome' || 
                      msg.type === 'orchestrators_list';
    
    // Filtrer les messages de debug selon le toggle
    if (msg.type === 'debug') {
      return showDebugInChat && isRelevant;
    }
    
    return isRelevant;
  });

  useEffect(() => {
    if (messages.length) {
      const lastMessage = messages[messages.length - 1];
      if (
        (lastMessage.type === "welcome" || lastMessage.type === "orchestrators_list") && 
        lastMessage.orchestrators
      ) {
        setOrchestrators(lastMessage.orchestrators);
      }
    }
  }, [messages]);

  const handleSubmit = () => {
    if (!message.trim() || !currentOrchestratorId) return;

    const userMessage = {
      type: "user",
      message: message,
      orchestratorId: currentOrchestratorId
    };

    addMessage(userMessage);
    sendMessage(userMessage);
    setMessage("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleOrchestratorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrentOrchestratorId(e.target.value);
  };

  const formatDebugMessage = (msg: Message) => {
    if (msg.type === 'debug') {
      const debugMsg = msg as DebugMessage;
      const time = new Date(debugMsg.timestamp).toLocaleTimeString();
      const content = debugMsg.data 
        ? JSON.stringify(debugMsg.data, null, 2)
        : debugMsg.message;

      return `[${time}] ${debugMsg.messageType}: ${content}`;
    }
    return JSON.stringify(msg, null, 2);
  };

  const getFullState = () => {
    return useAppStore.getState();
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Chat</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <Separator orientation="vertical" className="mx-2 h-4" />
          <select
            value={currentOrchestratorId}
            onChange={handleOrchestratorChange}
            className="px-2 py-1 rounded-md border border-border bg-background text-foreground 
                     focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {orchestrators.map((orch) => (
              <option key={orch.id} value={orch.id}>
                {orch.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md border border-border hover:bg-muted"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => setShowDebugInChat(!showDebugInChat)}
            className="px-2 py-1 rounded-md border border-border hover:bg-muted"
          >
            {showDebugInChat ? "Hide Debug Messages" : "Show Debug Messages"}
          </button>
          
          <button
            onClick={toggleShowDebug}
            className="px-2 py-1 rounded-md border border-border hover:bg-muted"
          >
            {showDebug ? "Hide Debug Panel" : "Show Debug Panel"}
          </button>
        </div>
      </header>

      <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
        {showDebug && (
          <DebugPanel 
            messages={getMessagesForCurrentOrchestrator()} 
            state={getFullState()} 
          />
        )}

        <div className="relative flex flex-col h-[calc(100vh-5rem)] rounded-lg border bg-muted/50">
          <div className="flex-1 p-4 overflow-auto">
            <MessagesList messages={filteredMessages} />
          </div>

          <div className="px-4 py-3 border-t border-gray-300 bg-background flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground 
                         focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 
                         focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
