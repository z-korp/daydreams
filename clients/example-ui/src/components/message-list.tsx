import * as React from "react";

interface MessageType {
  type: "user" | "assistant" | "system" | "error" | "other" | "welcome" | "info";
  message?: string;
  error?: string;
}

interface MessagesListProps {
  messages: MessageType[];
  message: string;
  setMessage: (message: string) => void;
}

export function MessagesList({ messages }: MessagesListProps) {
  
  return (
    <div className="flex flex-col space-y-4">
      {messages.map((msg, i) => {
        let containerClass = "flex items-start"; 
        let bubbleClass =
          "max-w-[70%] rounded-2xl p-4 text-sm shadow-md transition-all duration-200 hover:shadow-lg";

        
        switch (msg.type) {
          case "user":
            containerClass += " justify-end";
            bubbleClass +=
              " bg-gradient-to-r from-blue-500 to-blue-600 text-white mr-2 self-end hover:from-blue-600 hover:to-blue-700"; 
            break;

          case "assistant":
            containerClass += " justify-start";
            bubbleClass +=
              " bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 ml-2 self-start border border-gray-200 hover:border-gray-300"; 
            break;

          case "system":
            containerClass += " justify-center";
            bubbleClass += " bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-900 border border-yellow-200 hover:border-yellow-300";
            break;

          case "error":
            containerClass += " justify-center";
            bubbleClass += " bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-semibold border border-red-200 hover:border-red-300";
            break;

          case "welcome":
            containerClass += " justify-center";
            bubbleClass += " bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200 hover:border-green-300";
            break;

          case "info":
            containerClass += " justify-center";
            bubbleClass += " bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 hover:border-blue-300";
            break;

          default:
            containerClass += " justify-start";
            bubbleClass += " bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 ml-2 border border-gray-200";
        }

        return (
          <div key={i} className={containerClass}>
            <div className={`${bubbleClass} backdrop-blur-sm`}>
           
              {msg.type !== "user" && msg.type !== "assistant" && (
                <div className="mb-2 text-xs font-medium uppercase tracking-wider opacity-80 bg-gray-100 rounded-lg p-1">
                  {msg.type}
                </div>
              )}
              {msg.message && <div className="text-base whitespace-pre-wrap break-words rounded-lg p-2">{msg.message}</div>}
              {msg.error && <div className="font-medium">{msg.error}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}