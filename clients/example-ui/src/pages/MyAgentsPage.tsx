import { useState, useEffect } from "react";
import { useDaydreamsWs } from "@/hooks/use-daydreams";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

interface Orchestrator {
  id: string;
  name: string;
}

interface MessageType {
  type: string;
  message?: string;
  error?: string;
  orchestratorId?: string;
}

interface MyAgentsPageProps {
  currentOrchestratorId: string;
  setCurrentOrchestratorId: (id: string) => void;
}

export function MyAgentsPage({ 
  currentOrchestratorId, 
  setCurrentOrchestratorId 
}: MyAgentsPageProps) {
  const [orchestrators, setOrchestrators] = useState<Orchestrator[]>([]);
  const [newOrchestratorName, setNewOrchestratorName] = useState("");
  const { messages, sendMessage, isConnected } = useDaydreamsWs();

  useEffect(() => {
    if (isConnected) {
      sendMessage({
        type: "list_orchestrators"
      });
    }
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.type === "welcome" && lastMessage.orchestrators) {
      setOrchestrators(lastMessage.orchestrators);
      if (!currentOrchestratorId && lastMessage.orchestrators.length > 0) {
        setCurrentOrchestratorId(lastMessage.orchestrators[0].id);
      }
    }

    if (lastMessage.type === "orchestrator_created" && lastMessage.orchestrator) {
      sendMessage({
        type: "list_orchestrators"
      });
    }

    if (lastMessage.type === "orchestrators_list" && lastMessage.orchestrators) {
      setOrchestrators(lastMessage.orchestrators);
      if (!currentOrchestratorId && lastMessage.orchestrators.length > 0) {
        setCurrentOrchestratorId(lastMessage.orchestrators[0].id);
      }
    }
  }, [messages, sendMessage, currentOrchestratorId, setCurrentOrchestratorId]);

  const handleCreateOrchestrator = () => {
    if (!newOrchestratorName.trim()) return;
    sendMessage({
      type: "create_orchestrator",
      name: newOrchestratorName,
    });
    setNewOrchestratorName("");
  };

  const handleSelectOrchestrator = (orchId: string) => {
    setCurrentOrchestratorId(orchId);
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
                  <Link to="/my-agents">My Agents</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="p-4">
        <div className="grid gap-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">My Orchestrators</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {orchestrators.map(orch => (
                <div
                  key={orch.id}
                  onClick={() => handleSelectOrchestrator(orch.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors
                    ${currentOrchestratorId === orch.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-card hover:border-primary'}`}
                >
                  <h3 className="font-semibold">{orch.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">ID: {orch.id}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Create New Orchestrator</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOrchestratorName}
                onChange={(e) => setNewOrchestratorName(e.target.value)}
                placeholder="Orchestrator name..."
                className="flex-1 px-4 py-2 rounded-lg border"
              />
              <button
                onClick={handleCreateOrchestrator}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 