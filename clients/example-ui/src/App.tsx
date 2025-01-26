import { Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import HomePage from "@/pages/HomePage";
import { MyAgentsPage } from "@/pages/MyAgentsPage";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useDaydreamsWs } from "@/hooks/use-daydreams";

function App() {
  const { currentOrchestratorId, setCurrentOrchestratorId } = useDaydreamsWs();

  return (
    <SidebarProvider className="font-body">
      <AppSidebar />
      <SidebarInset>
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                currentOrchestratorId={currentOrchestratorId} 
              />
            } 
          />
          <Route 
            path="/my-agents" 
            element={
              <MyAgentsPage 
                currentOrchestratorId={currentOrchestratorId}
                setCurrentOrchestratorId={setCurrentOrchestratorId}
              />
            } 
          />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
