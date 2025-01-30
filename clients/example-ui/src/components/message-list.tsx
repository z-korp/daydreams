import React, { useRef, useEffect } from 'react';

interface MessageType {
    type: "INPUT" | "OUTPUT" | "SYSTEM" | "ERROR" | "OTHER" | "WELCOME" | "INFO";
    message?: string;
    error?: string;
    timestamp?: number;
}

interface MessagesListProps {
    messages: MessageType[];
}

export function MessagesList({ messages }: MessagesListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const getMessageClasses = (msg: MessageType) => {
        const baseBubble = `
            relative p-4 text-sm
            shadow-md transition-all duration-200
            w-[80%] whitespace-pre-wrap break-words
            border-opacity-50 dither-border
        `;

        let containerClass = "flex items-start mb-4 px-4";
        let bubbleClass = baseBubble;

        switch (msg.type) {
            case "INPUT":
                containerClass += " justify-end";
                bubbleClass += `
                    bg-card text-foreground mr-2
                    self-end hover:brightness-110
                `;
                break;

            case "OUTPUT":
                containerClass += " justify-start";
                bubbleClass += `
                    bg-card text-foreground ml-2
                    hover:brightness-105
                `;
                break;

            case "SYSTEM":
                containerClass += " justify-center";
                bubbleClass += `
                    bg-card text-muted-foreground
                    hover:brightness-105
                `;
                break;

            case "ERROR":
                containerClass += " justify-center";
                bubbleClass += `
                    bg-card text-destructive font-semibold
                    hover:brightness-105
                `;
                break;

            case "WELCOME":
                containerClass += " justify-center";
                bubbleClass += `
                    bg-card text-accent-foreground
                    hover:brightness-105
                `;
                break;

            default:
                containerClass += " justify-start";
                bubbleClass += `
                    bg-card text-card-foreground ml-2
                    hover:brightness-105
                `;
        }

        return { containerClass, bubbleClass };
    };

    return (
        <div className="flex flex-col w-full">
            {messages.map((msg, i) => {
                const { containerClass, bubbleClass } = getMessageClasses(msg);
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : null;

                return (
                    <div key={i} className={containerClass}>
                        <div className={bubbleClass}>
                            {msg.type !== "INPUT" && msg.type !== "OUTPUT" && (
                                <div className="mb-1 text-xs font-medium uppercase tracking-wider opacity-80">
                                    {msg.type}
                                </div>
                            )}

                            <div className={`
                                text-base break-words overflow-x-auto
                                ${time ? 'mb-4' : ''}
                            `}>
                                {msg.message}
                            </div>

                            {msg.error && (
                                <div className="text-sm font-medium text-destructive mt-1">
                                    {msg.error}
                                </div>
                            )}

                            {time && (
                                <div className="text-xs opacity-50 absolute bottom-1 right-2">
                                    {time}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}