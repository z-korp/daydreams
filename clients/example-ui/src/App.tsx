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

import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";

interface MessageType {
    type: "user" | "assistant" | "system" | "error" | "other";
    message?: string;
    error?: string;
}

function App() {
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState<MessageType[]>([]);
    const { messages, sendGoal } = useDaydreamsWs();

    // Synchronise les messages du hook dans allMessages
    useEffect(() => {
        if (messages.length === 0) return;
        const lastMessage = messages[messages.length - 1];
        setAllMessages((prev: any) => {
            // On évite les doublons si le dernier message est identique
            if (
                prev.length > 0 &&
                JSON.stringify(prev[prev.length - 1]) ===
                    JSON.stringify(lastMessage)
            ) {
                return prev;
            }
            return [...prev, lastMessage];
        });
    }, [messages]);

    const handleSubmit = () => {
        if (!message.trim()) return;
        setAllMessages((prev) => [...prev, { type: "user", message: message }]);
        sendGoal(message);
        setMessage("");
    };

    return (
        <ThemeProvider>
            <SidebarProvider className="font-body">
                <AppSidebar />
                <SidebarInset>
                    {/* Header */}
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <ModeToggle />
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 h-4"
                            />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="#">
                                            Home
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
                </SidebarInset>
            </SidebarProvider>
        </ThemeProvider>
    );
}

export default App;
