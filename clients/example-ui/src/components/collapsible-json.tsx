import { useState } from "react";

interface CollapsibleJsonProps {
  data: any;
  level?: number;
  isExpanded?: boolean;
}

export function CollapsibleJson({ data, level = 0, isExpanded = true }: CollapsibleJsonProps) {
  const [isOpen, setIsOpen] = useState(isExpanded);

  if (typeof data !== 'object' || data === null) {
    return <span>{JSON.stringify(data)}</span>;
  }

  const isArray = Array.isArray(data);
  const isEmpty = Object.keys(data).length === 0;

  if (isEmpty) {
    return <span>{isArray ? '[]' : '{}'}</span>;
  }

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <div 
        onClick={toggleOpen}
        className="cursor-pointer hover:opacity-80 inline-flex items-center gap-1"
      >
        <span className="text-xs transition-transform duration-200" style={{ 
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
        }}>
          ▶
        </span>
        <span>{isArray ? '[' : '{'}</span>
        {!isOpen && <span className="opacity-50">...</span>}
        {!isOpen && <span>{isArray ? ']' : '}'}</span>}
      </div>
      
      {isOpen && (
        <div className="ml-4 border-l border-current/20 pl-2">
          {Object.entries(data).map(([key, value], index) => (
            <div key={key} className="my-1">
              <span className="opacity-70">{isArray ? '' : `${key}: `}</span>
              <CollapsibleJson data={value} level={level + 1} isExpanded={true} />
              {index < Object.keys(data).length - 1 && <span>,</span>}
            </div>
          ))}
          <div>{isArray ? ']' : '}'}</div>
        </div>
      )}
    </div>
  );
} 