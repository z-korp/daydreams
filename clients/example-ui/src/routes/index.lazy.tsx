import { createLazyFileRoute } from "@tanstack/react-router";
import  ChatUI  from "@/components/chat-list";
export const Route = createLazyFileRoute("/")({
    component: Index,
});

function Index() {
    return <ChatUI />;
}
