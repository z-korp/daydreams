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
import { useState } from "react";
//import { ChatBox } from "@/components/chat/chatbox";
//import { useZidle } from "./hooks/use-zidle";

function App() {
    const [message, setMessage] = useState("");
    //const { messages, sendMessage } = useZidle();

    const handleSubmit = async () => {
        if (!message.trim()) return;

        const content = message;
        console.log(content);
        setMessage(""); // Clear input
        //await sendMessage(content);
    };

    return (
        <SidebarProvider className="font-body">
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
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
                                {/* <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem> */}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* <ChatBox
                        messages={messages}
                        onSendMessage={handleSubmit}
                        inputValue={message}
                        onInputChange={(e) => setMessage(e.target.value)}
                    /> */}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default App;
