import { useState, useEffect } from "react";
import { MessagesList } from "@/components/message-list";
import { useDaydreamsWs } from "@/hooks/use-daydreams";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

interface MessageType {
  type: "user" | "assistant" | "system" | "error" | "other" | "response";
  message?: string;
  error?: string;
  orchestratorId?: string;
}

function HomePage() {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<MessageType[]>([]);
  const { messages, sendMessage } = useDaydreamsWs();
  const [currentOrchestratorId, setCurrentOrchestratorId] = useState<string>("");

  // Synchronise les messages du hook dans allMessages
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];

    // Gérer le message de bienvenue et sélectionner l'orchestrateur par défaut
    if (lastMessage.type === "welcome" && lastMessage.orchestrators) {
      const defaultOrch = lastMessage.orchestrators[0];
      if (defaultOrch) {
        setCurrentOrchestratorId(defaultOrch.id);
      }
    }

    // Convertir le message de réponse en format MessageType
    let messageToAdd: MessageType;
    if (lastMessage.type === "response") {
      messageToAdd = {
        type: "assistant",
        message: lastMessage.message,
        orchestratorId: lastMessage.orchestratorId,
      };
    } else {
      messageToAdd = lastMessage as MessageType;
    }

    setAllMessages((prev) => {
      // On évite les doublons
      if (prev.length > 0 && JSON.stringify(prev[prev.length - 1]) === JSON.stringify(messageToAdd)) {
        return prev;
      }
      return [...prev, messageToAdd];
    });
  }, [messages]);

  const handleSubmit = () => {
    if (!message.trim() || !currentOrchestratorId) return;

    // Ajouter le message de l'utilisateur à l'interface
    const userMessage: MessageType = {
      type: "user",
      message: message,
      orchestratorId: currentOrchestratorId,
    };
    setAllMessages((prev) => [...prev, userMessage]);

    // Envoyer le message au serveur avec l'orchestratorId
    sendMessage({
      type: "user",
      message: message,
      orchestratorId: currentOrchestratorId,
    });

    setMessage("");
  };

  return (
    <>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/">Chat</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
          {/* Zone conversation */}
          <div className="relative flex flex-col h-[calc(100vh-5rem)] rounded-lg border bg-muted/50 md:min-h-min">
            {/* Liste des messages */}
            <div className="flex-1 p-4 overflow-auto">
              <MessagesList messages={allMessages} />
            </div>

            {/* Barre d'input en bas */}
            <div className="px-4 py-3 border-t border-gray-300 bg-background flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
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
