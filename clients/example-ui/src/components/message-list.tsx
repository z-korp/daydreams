import React from 'react';

interface Message {
  type: string;
  content: string;
  timestamp: number;
}

interface MessagesListProps {
  messages: Message[];
}

export const MessagesList: React.FC<MessagesListProps> = ({ messages }) => {
  return (
    <div className="flex flex-col space-y-4">
      {messages.map((msg, i) => {
        const baseBubble = `
          relative
          rounded-2xl
          p-4
          text-sm
          shadow-md
          transition-all
          duration-200
          max-w-[80%]
          whitespace-pre-wrap
          break-words
        `;

        let containerClass = "flex items-start";
        let bubbleClass = baseBubble;
        
        switch (msg.type) {
          case "user":
            containerClass += " justify-end";
            bubbleClass += `
              bg-gradient-to-r from-blue-600 to-blue-500 text-white mr-2
              self-end hover:brightness-110
            `;
            break;

          case "assistant":
            containerClass += " justify-start";
            bubbleClass += `
              bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 ml-2
              border border-gray-300
              hover:brightness-95
            `;
            break;
            case "system":
              containerClass += " justify-center";
              bubbleClass += `
                bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-900
                border border-yellow-200 hover:brightness-105
              `;
              break;
  
            case "error":
              containerClass += " justify-center";
              bubbleClass += `
                bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-semibold
            border border-red-200 hover:brightness-105
            `;
            break;

          case "welcome":
            containerClass += " justify-center";
            bubbleClass += `
              bg-gradient-to-r from-green-50 to-green-100 text-green-800
              border border-green-200 hover:brightness-105
            `;
            break;

          case "info":
            containerClass += " justify-center";
            bubbleClass += `
              bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800
              border border-blue-200 hover:brightness-105
            `;
            break;

          default:
            containerClass += " justify-start";
            bubbleClass += `
              bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 ml-2
              border border-gray-300
            `;
        }

        return (
          <div key={i} className={containerClass}>
                <div className={bubbleClass}>
            {/* Affiche le type si ce n’est pas un user/assistant classique */}
            {msg.type !== "user" && msg.type !== "assistant" && (
                <div className="mb-1 text-xs font-medium uppercase tracking-wider opacity-80">
                  {msg.type}
                </div>
              )}

              {msg.message && (
                <div className="text-base">
                  {msg.message}
                </div>
              )}

              {msg.error && (
                <div className="text-sm font-medium text-red-800 mt-1">
                  {msg.error}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
