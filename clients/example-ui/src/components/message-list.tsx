import { useEffect, useRef } from "react";

interface Message {
  type: string;
  message?: string;
  error?: string;
  orchestratorId?: string;
}

export function MessagesList({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getMessageClasses = (type: string) => {
    let containerClass = "flex w-full mb-4 px-4";
    let bubbleClass = "px-4 py-2 rounded-lg max-w-[80%]";

    switch (type) {
      case "user":
        containerClass += " justify-end";
        bubbleClass += " message-user";
        break;

      case "response":
        containerClass += " justify-start";
        bubbleClass += " message-assistant";
        break;

      case "system":
        containerClass += " justify-center";
        bubbleClass += " message-system";
        break;

      case "error":
        containerClass += " justify-center";
        bubbleClass += " message-error";
        break;

      case "welcome":
        containerClass += " justify-center";
        bubbleClass += " message-welcome";
        break;

      case "info":
        containerClass += " justify-center";
        bubbleClass += " message-info";
        break;

      default:
        containerClass += " justify-start";
        bubbleClass += " message-assistant";
    }

    return { containerClass, bubbleClass };
  };

  return (
    <div className="flex flex-col w-full">
      {messages.map((msg, idx) => {
        const { containerClass, bubbleClass } = getMessageClasses(msg.type);
        return (
          <div key={idx} className={containerClass}>
            <div className={bubbleClass}>
              {msg.message || msg.error || JSON.stringify(msg)}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
