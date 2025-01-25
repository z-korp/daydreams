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

interface MessageType {
  type: "user" | "assistant" | "system" | "error" | "other";
  message?: string;
  error?: string;
}

function App() {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<MessageType[]>([]);
  const { messages, sendGoal } = useDaydreamsWs();
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    setAllMessages((prev) => {
      if (prev.length > 0 && JSON.stringify(prev[prev.length - 1]) === JSON.stringify(lastMessage)) {
        return prev;
      }
      return [...prev, lastMessage];
    });
  }, [messages]);


  const handleSubmit = () => {
    if (!message.trim()) return;
    setAllMessages((prev) => [
      ...prev,
      { type: "user", message: message },
    ]);
    sendGoal(message);
    setMessage("");
  };

  return (
    <SidebarProvider className="font-body">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center space-x-2">
            <input
              className="border p-2 flex-1"
              type="text"
              value={message}
              placeholder="Enter a goal..."
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2"
            >
              Send
            </button>
          </div>

          {/* Affichage des messages via MessageList */}
          <MessagesList messages={messages} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
