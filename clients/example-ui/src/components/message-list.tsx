import { CollapsibleJson } from "./collapsible-json";

interface MessageType {
    type:
        | "user"
        | "assistant"
        | "system"
        | "error"
        | "other"
        | "welcome"
        | "info";
    message?: string;
    error?: string;
}

export function MessagesList({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

export function MessagesList({ messages }: MessagesListProps) {
    console.log("messages", messages);
    return (
        <div className="flex flex-col space-y-4 w-1/2 mx-auto">
            {messages.map((msg, i) => {
                const baseBubble = `
          relative
        
          p-4
          text-sm
          shadow-md
          transition-all
          duration-200
         w-[80%]
          whitespace-pre-wrap
          break-words
          border-opacity-50
        `;

  const getMessageClasses = (msg: Message) => {
    let containerClass = "flex w-full mb-4 px-4";
    let bubbleClass = `
      px-4 py-2 rounded-lg max-w-[80%] font-medium 
      relative overflow-hidden
      before:absolute before:inset-[1px] before:bg-background/80 before:rounded-lg before:z-0
      after:absolute after:inset-0 after:rounded-lg after:z-[-1]
      after:bg-gradient-to-r after:bg-[length:200%_100%]
      [&>*]:relative [&>*]:z-10
    `;

                switch (msg.type) {
                    case "user":
                        containerClass += " justify-end";
                        bubbleClass += `
               bg-card text-foreground mr-2
              self-end hover:brightness-110
              dither-border 
            `;
                        break;

    if (msg.type === 'debug') {
      switch (msg.messageType) {
        case "error":
          containerClass += " justify-start";
          bubbleClass += " after:from-[#FF585D] after:via-[#FF585D]/30 after:to-[#FF585D]/80 text-[#FF585D] shadow-[0_0_30px_rgba(255,88,93,0.3)]";
          break;

        case "ai_response":
          containerClass += " justify-start";
          bubbleClass += " after:from-[#00FFC3] after:via-[#00FFC3]/30 after:to-[#00FFC3]/80 text-[#00FFC3] shadow-[0_0_30px_rgba(0,255,195,0.3)]";
          break;

        case "raw_outputs":
        case "processing_start":
          containerClass += " justify-start";
          bubbleClass += " after:from-[#9F00C5] after:via-[#9F00C5]/30 after:to-[#9F00C5]/80 text-[#9F00C5] shadow-[0_0_30px_rgba(159,0,197,0.3)]";
          break;

        case "user_input":
          containerClass += " justify-end";
          bubbleClass += " after:from-[#FF307B] after:via-[#FF307B]/30 after:to-[#FF307B]/80 text-[#FF307B] shadow-[0_0_30px_rgba(255,48,123,0.3)]";
          break;

        default:
          containerClass += " justify-start";
          bubbleClass += " after:from-[#1CEB92] after:via-[#1CEB92]/30 after:to-[#1CEB92]/80 text-[#1CEB92] shadow-[0_0_30px_rgba(28,235,146,0.3)]";
      }
    } else {
      switch (msg.type) {
        case "user":
          containerClass += " justify-end";
          bubbleClass += " after:from-[#FF307B] after:via-[#FF307B]/30 after:to-[#FF307B]/80 text-[#FF307B] shadow-[0_0_30px_rgba(255,48,123,0.3)]";
          break;

        case "response":
          containerClass += " justify-start";
          bubbleClass += " after:from-[#00FFC3] after:via-[#00FFC3]/30 after:to-[#00FFC3]/80 text-[#00FFC3] shadow-[0_0_30px_rgba(0,255,195,0.3)]";
          break;

        case "welcome":
          containerClass += " justify-center";
          bubbleClass += " after:from-[#1CEB92] after:via-[#1CEB92]/30 after:to-[#1CEB92]/80 text-[#1CEB92] shadow-[0_0_30px_rgba(28,235,146,0.3)]";
          break;

        default:
          containerClass += " justify-start";
          bubbleClass += " after:from-[#9F00C5] after:via-[#9F00C5]/30 after:to-[#9F00C5]/80 text-[#9F00C5] shadow-[0_0_30px_rgba(159,0,197,0.3)]";
      }
    }

    bubbleClass += ` 
      hover:before:bg-opacity-70
      hover:after:animate-[gradient_3s_ease_infinite]
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
      if (msg.messageType === 'raw_outputs' && msg.data) {
        return <CollapsibleJson data={msg.data} />;
      }
      
      if (msg.data) {
        try {
          if (typeof msg.data === 'object') {
            return <CollapsibleJson data={msg.data} />;
          }
          return JSON.stringify(msg.data, null, 2);
        } catch (e) {
          return String(msg.data);
        }
      }
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
            <div className={`${bubbleClass} overflow-hidden relative`}>
              {msg.type === 'debug' && msg.messageType && !msg.isLoading && (
                <div className="text-xs font-semibold mb-2 opacity-70">
                  {msg.messageType}
                </div>
              )}
              <div 
                className={`
                  ${msg.data && !msg.isLoading ? "whitespace-pre-wrap font-mono text-sm" : ""}
                  break-words overflow-x-auto
                  ${msg.type === 'debug' && !msg.isLoading ? 'max-h-[300px] overflow-y-auto' : ''}
                  ${time ? 'mb-4' : ''}
                `}
              >
                {formattedMessage}
              </div>
              {time && !msg.isLoading && (
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
