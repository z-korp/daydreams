import { useEffect, useRef } from "react";

interface Message {
  type: string;
  messageType?: string;
  message?: string;
  error?: string;
  orchestratorId?: string;
  data?: any;
  timestamp?: number;
  isLoading?: boolean;
}

export function MessagesList({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getMessageClasses = (msg: Message) => {
    let containerClass = "flex w-full mb-4 px-4";
    let bubbleClass = `
      px-4 py-2 rounded-lg max-w-[80%] font-medium 
      relative overflow-hidden
      before:absolute before:inset-[1px] before:bg-background/80 before:rounded-lg before:z-0
      after:absolute after:inset-0 after:rounded-lg after:z-[-1]
      after:bg-gradient-to-r after:blur-[2px]
      [&>*]:relative [&>*]:z-10
    `;

    if (msg.isLoading) {
      containerClass += " justify-start";
      bubbleClass += `
        after:from-[#00FFC3] after:via-[#00FFC3]/50 after:to-[#00FFC3]
        text-[#00FFC3] animate-pulse
        shadow-[0_0_30px_rgba(0,255,195,0.3)]
      `;
      return { containerClass, bubbleClass };
    }

    if (msg.type === 'debug') {
      switch (msg.messageType) {
        case "error":
          containerClass += " justify-start";
          bubbleClass += " after:from-[#FF585D] after:via-[#FF585D]/50 after:to-[#FF585D] text-[#FF585D] shadow-[0_0_30px_rgba(255,88,93,0.3)]";
          break;

        case "ai_response":
          containerClass += " justify-start";
          bubbleClass += " after:from-[#00FFC3] after:via-[#00FFC3]/50 after:to-[#00FFC3] text-[#00FFC3] shadow-[0_0_30px_rgba(0,255,195,0.3)]";
          break;

        case "raw_outputs":
        case "processing_start":
          containerClass += " justify-start";
          bubbleClass += " after:from-[#9F00C5] after:via-[#9F00C5]/50 after:to-[#9F00C5] text-[#9F00C5] shadow-[0_0_30px_rgba(159,0,197,0.3)]";
          break;

        case "user_input":
          containerClass += " justify-end";
          bubbleClass += " after:from-[#FF307B] after:via-[#FF307B]/50 after:to-[#FF307B] text-[#FF307B] shadow-[0_0_30px_rgba(255,48,123,0.3)]";
          break;

        default:
          containerClass += " justify-start";
          bubbleClass += " after:from-[#1CEB92] after:via-[#1CEB92]/50 after:to-[#1CEB92] text-[#1CEB92] shadow-[0_0_30px_rgba(28,235,146,0.3)]";
      }
    } else {
      switch (msg.type) {
        case "user":
          containerClass += " justify-end";
          bubbleClass += " after:from-[#FF307B] after:via-[#FF307B]/50 after:to-[#FF307B] text-[#FF307B] shadow-[0_0_30px_rgba(255,48,123,0.3)]";
          break;

        case "response":
          containerClass += " justify-start";
          bubbleClass += " after:from-[#00FFC3] after:via-[#00FFC3]/50 after:to-[#00FFC3] text-[#00FFC3] shadow-[0_0_30px_rgba(0,255,195,0.3)]";
          break;

        case "welcome":
          containerClass += " justify-center";
          bubbleClass += " after:from-[#1CEB92] after:via-[#1CEB92]/50 after:to-[#1CEB92] text-[#1CEB92] shadow-[0_0_30px_rgba(28,235,146,0.3)]";
          break;

        default:
          containerClass += " justify-start";
          bubbleClass += " after:from-[#9F00C5] after:via-[#9F00C5]/50 after:to-[#9F00C5] text-[#9F00C5] shadow-[0_0_30px_rgba(159,0,197,0.3)]";
      }
    }

    bubbleClass += ` 
      hover:before:bg-opacity-70
      hover:shadow-[0_0_50px_rgba(var(--shadow-color),0.5)]
      hover:after:animate-pulse
      transition-all duration-300
    `;

    return { containerClass, bubbleClass };
  };

  const formatMessage = (msg: Message) => {
    if (msg.isLoading) {
      return (
        <div className="flex items-center gap-2">
          <span>Thinking</span>
          <span className="flex gap-1">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-100">.</span>
            <span className="animate-bounce delay-200">.</span>
          </span>
        </div>
      );
    }

    if (msg.type === 'debug') {
      if (msg.data) {
        try {
          return JSON.stringify(msg.data, null, 2);
        } catch (e) {
          return String(msg.data);
        }
      }
      return msg.message;
    }
    return msg.message || msg.error || JSON.stringify(msg);
  };

  return (
    <div className="flex flex-col w-full">
      {messages.map((msg, idx) => {
        const { containerClass, bubbleClass } = getMessageClasses(msg);
        const formattedMessage = formatMessage(msg);
        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : null;

        return (
          <div key={idx} className={containerClass}>
            <div className={`${bubbleClass} overflow-hidden`}>
              {time && !msg.isLoading && (
                <div className="text-xs opacity-50 mb-1">
                  {time}
                </div>
              )}
              {msg.type === 'debug' && msg.messageType && !msg.isLoading && (
                <div className="text-xs font-semibold mb-1 opacity-70">
                  {msg.messageType}
                </div>
              )}
              <div 
                className={`
                  ${msg.data && !msg.isLoading ? "whitespace-pre-wrap font-mono text-sm" : ""}
                  break-words overflow-x-auto
                  ${msg.type === 'debug' && !msg.isLoading ? 'max-h-[300px] overflow-y-auto' : ''}
                `}
              >
                {formattedMessage}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
