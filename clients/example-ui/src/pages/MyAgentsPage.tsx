import { useState, useEffect } from "react";
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
import { ChangeEvent } from 'react';
import { CreateCharacterModal } from "@/components/create-character-modal";

interface Orchestrator {
  id: string;
  name: string;
}

interface Character {
  name: string;
  bio: string;
  traits: Array<{
    name: string;
    description: string;
    strength: number;
    examples: string[];
  }>;
  voice: {
    tone: string;
    style: string;
    vocabulary: string[];
    commonPhrases: string[];
    emojis: string[];
  };
  instructions: {
    goals: string[];
    constraints: string[];
    topics: string[];
    responseStyle: string[];
    contextRules: string[];
  };
}

export function MyAgentsPage() {
  const [orchestrators, setOrchestrators] = useState<Orchestrator[]>([]);
  const [newOrchestratorName, setNewOrchestratorName] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { currentOrchestratorId, setCurrentOrchestratorId, messages, characters, addCharacter } = useAppStore();
  const { sendMessage } = useDaydreamsWs();

  // État pour le formulaire de création d'agent
  const [newAgent, setNewAgent] = useState<Partial<Character>>({
    name: "",
    bio: "",
    traits: [],
    voice: {
      tone: "",
      style: "",
      vocabulary: [],
      commonPhrases: [],
      emojis: []
    },
    instructions: {
      goals: [],
      constraints: [],
      topics: [],
      responseStyle: [],
      contextRules: []
    }
  });

  useEffect(() => {
    if (messages.length) {
      const lastMessage = messages[messages.length - 1];
      if ((lastMessage.type === "welcome" || lastMessage.type === "orchestrators_list") && lastMessage.orchestrators) {
        setOrchestrators(lastMessage.orchestrators);
      }
    }
  }, [messages]);

  const handleCreateOrchestrator = () => {
    if (!newOrchestratorName.trim()) return;
    sendMessage({
      type: "create_orchestrator",
      name: newOrchestratorName,
    });
    setNewOrchestratorName("");
  };

  const handleCreateCharacter = (character: Character) => {
    sendMessage({
      type: "create_character",
      ...character
    });

    addCharacter(character);
  };

  return (
    <div className="flex flex-col h-full">
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

      <div className="flex-1 p-4 space-y-8 overflow-auto">
        {/* Section Orchestrateurs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">My Orchestrators</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orchestrators.map(orch => (
              <div
                key={orch.id}
                onClick={() => setCurrentOrchestratorId(orch.id)}
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
              Create Orchestrator
            </button>
          </div>
        </section>

        {/* Section Characters */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Characters</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
            >
              Create Character
            </button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <div key={character.name} className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold">{character.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{character.bio.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <CreateCharacterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCharacter}
      />
    </div>
  );
} 