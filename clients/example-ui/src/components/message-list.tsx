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
        let containerClass = "flex w-full mb-4 px-4";
        let bubbleClass = `
            px-4 py-2 rounded-lg max-w-[80%] font-medium 
            relative overflow-hidden
            bg-card text-foreground
            before:absolute before:inset-[1px] before:rounded-lg before:z-0
            [&>*]:relative [&>*]:z-10
            shadow-[0_0_30px_hsl(var(--primary)/0.05)]
            border border-[hsl(var(--primary))]/30
        `;

        switch (msg.type) {
            case "INPUT":
                containerClass += " justify-end";
                break;

            case "OUTPUT":
                containerClass += " justify-start";
                break;

            case "SYSTEM":
                containerClass += " justify-center";
                break;

            case "ERROR":
                containerClass += " justify-start";
                break;

            default:
                containerClass += " justify-start";
        }

        bubbleClass += ` 
            hover:brightness-105
            transition-all duration-300
        `;

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
                                <div className="text-xs font-semibold mb-2 opacity-70">
                                    {msg.type}
                                </div>
                            )}

                            <div className={`
                                break-words overflow-x-auto
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