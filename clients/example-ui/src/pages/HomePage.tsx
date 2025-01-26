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

type Message = WelcomeMessage | ResponseMessage | UserMessage;

interface Orchestrator {
  id: string;
  name: string;
}

function HomePage() {
  const [message, setMessage] = useState("");
  const [orchestrators, setOrchestrators] = useState<Orchestrator[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const { 
    currentOrchestratorId, 
    setCurrentOrchestratorId, 
    messages,
    getMessagesForCurrentOrchestrator 
  } = useAppStore();
  const { sendMessage } = useDaydreamsWs();

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
        </div>
        
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="px-2 py-1 rounded-md border border-border hover:bg-muted"
        >
          {showDebug ? "Hide Debug" : "Show Debug"}
        </button>
      </header>

      <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
        {showDebug && (
          <div className="p-4 rounded-lg border bg-muted/50 overflow-auto max-h-[300px]">
            <h3 className="font-semibold mb-2">Debug Messages for Orchestrator: {currentOrchestratorId}</h3>
            <pre className="text-xs">
              {JSON.stringify(getMessagesForCurrentOrchestrator(), null, 2)}
            </pre>
          </div>
        )}

        <div className="relative flex flex-col h-[calc(100vh-5rem)] rounded-lg border bg-muted/50">
          <div className="flex-1 p-4 overflow-auto">
            <MessagesList messages={messages} />
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
