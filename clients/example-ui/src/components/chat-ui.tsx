import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { MessagesList } from "@/components/message-list";
import { useDaydreamsWs } from "@/hooks/use-daydreams";
import { useAppStore } from "@/store/use-app-store";
import { DebugPanel } from "./debug-panel";
import type { MessageType } from '@/types/chat';
import { Route } from '@/routes/chats/$chatId';
import { useChatHistories } from "@/hooks/use-chat-histories";
interface MessageType {
    type: "user" | "assistant" | "system" | "error" | "other";
    message?: string;
    error?: string;
}

const bladerunnerQuotes = [
    "I've seen things you people wouldn't believe...",
    "All those moments will be lost in time, like tears in rain",
    "More human than human is our motto",
    "Have you ever retired a human by mistake?",
    "It's too bad she won't live, but then again who does?",
    "I want more life, father",
];

export function ChatUI() {
    const [input, setInput] = useState('');
    const { currentOrchestratorId } = useAppStore();
    const { sendGoal } = useDaydreamsWs();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [allMessages, setAllMessages] = useState<MessageType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);
    const { showDebug } = useAppStore();
    const { chatId } = Route.useParams();
    
    const { chatItems, loading } = useChatHistories();
    console.log("chatItems", chatItems);
    const currentChat = chatItems.find(chat => chat._id === currentOrchestratorId);

    useEffect(() => {
        if (currentChat?.messages) {
            console.log('📝 Processing messages for chat:', chatId);
            const formattedMessages: MessageType[] = currentChat.messages.map(msg => ({
                type: msg.role,
                message: msg.data.content || msg.data.message || "",
            }));
            setAllMessages(formattedMessages);
        }
    }, [currentChat, chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [allMessages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !currentOrchestratorId) return;

        const userMessage: MessageType = {
            type: "input",
            message: input,
        };

        setAllMessages(prev => [...prev, userMessage]);
        setInput('');
      
        try {
            await sendGoal(
                input,
                currentOrchestratorId,
                currentChat?.userId,
            );
        } catch (error) {
            console.error('Failed to send message:', error);
            setAllMessages(prev => [
                ...prev,
                {
                    type: "ERROR",
                    error: "Failed to send message",
                },
            ]);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setQuoteIndex((prev) => (prev + 1) % bladerunnerQuotes.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {showDebug && (
                <DebugPanel 
                    messages={allMessages} 
                    state={useAppStore.getState()} 
                />
            )}

            <div className="flex-1 overflow-y-auto p-4">
                <MessagesList messages={allMessages} />
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 rounded-lg border"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || !currentOrchestratorId}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatUI;
