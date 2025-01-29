interface MessageType {
    type: "input" | "output" | "system" | "ERROR" | "OTHER" | "WELCOME" | "INFO";
    message?: string;
    error?: string;
}

interface MessagesListProps {
    messages: MessageType[];
}

export function MessagesList({ messages }: MessagesListProps) {
    return (
        <div className="flex flex-col space-y-4 w-1/2 mx-auto">
            {messages.map((msg, i) => {
                // Base classes that are common to all message types
                const baseClasses = [
                    "relative",
                    "p-4",
                    "text-sm",
                    "shadow-md",
                    "transition-all",
                    "duration-200",
                    "w-4/5",  // Using w-4/5 instead of w-[80%]
                    "whitespace-pre-wrap",
                    "break-words",
                    "border",
                    "border-opacity-50"
                ];

                // Container classes start with flex and items-start
                let containerClasses = ["flex", "items-start"];
                
                // Add specific classes based on message type
                switch (msg.type) {
                    case "input":
                        containerClasses.push("justify-end");
                        baseClasses.push(
                            "bg-card",
                            "text-foreground",
                            "mr-2",
                            "self-end",
                            "hover:brightness-110",
                            "border-primary",
                        );
                        break;

                    case "output":
                        containerClasses.push("justify-start");
                        baseClasses.push(
                            "bg-card",
                            "text-foreground",
                            "ml-2",
                            "hover:brightness-105",
                            "border-secondary"
                        );
                        break;

                    case "system":
                        containerClasses.push("justify-center");
                        baseClasses.push(
                            "bg-card",
                            "text-muted-foreground",
                            "hover:brightness-105",
                            "border-muted"
                        );
                        break;

                    case "ERROR":
                        containerClasses.push("justify-center");
                        baseClasses.push(
                            "bg-card",
                            "text-destructive",
                            "font-semibold",
                            "hover:brightness-105",
                            "border-destructive"
                        );
                        break;

                    case "WELCOME":
                        containerClasses.push("justify-center");
                        baseClasses.push(
                            "bg-card",
                            "text-accent-foreground",
                            "hover:brightness-105",
                            "border-accent"
                        );
                        break;

                    case "INFO":
                        containerClasses.push("justify-center");
                        baseClasses.push(
                            "bg-card",
                            "text-secondary-foreground",
                            "hover:brightness-105",
                            "border-secondary"
                        );
                        break;

                    default:
                        containerClasses.push("justify-start");
                        baseClasses.push(
                            "bg-card",
                            "text-card-foreground",
                            "ml-2",
                            "hover:brightness-105",
                            "border-primary"
                        );
                }
                console.log("msg:L110",baseClasses);
                console.log("msg:L110",msg.type);
                return (
                    <div key={i} className={containerClasses.join(" ")}>
                        <div className={baseClasses.join(" ")}>
                            {msg.type !== "INPUT" && msg.type !== "OUTPUT" && (
                                <div className="mb-1 text-xs font-medium uppercase tracking-wider opacity-80">
                                    {msg.type}
                                </div>
                            )}

                            {msg.message && (
                                <div className="text-base">{msg.message}</div>
                            )}

                            {msg.error && (
                                <div className="text-sm font-medium text-destructive mt-1">
                                    {msg.error}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}