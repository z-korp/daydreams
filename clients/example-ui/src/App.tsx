import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import HomePage from "@/pages/HomePage";
import { MyAgentsPage } from "@/pages/MyAgentsPage";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/store/use-app-store";

function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

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
