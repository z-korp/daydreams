import { Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import  HomePage  from "@/pages/HomePage";
import { MyAgentsPage } from "@/pages/MyAgentsPage";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

function App() {
  return (
    <SidebarProvider className="font-body">
      <AppSidebar />
      <SidebarInset>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/my-agents" element={<MyAgentsPage />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
