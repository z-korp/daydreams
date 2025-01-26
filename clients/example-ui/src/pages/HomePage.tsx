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
    toggleShowDebug
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
