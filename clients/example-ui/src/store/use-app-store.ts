import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Message {
  type: string;
  message?: string;
  error?: string;
  orchestratorId?: string;
  orchestrators?: Array<{
    id: string;
    name: string;
  }>;
  isLoading?: boolean;
  timestamp?: number;
}

interface AppState {
  currentOrchestratorId: string;
  messages: Message[];
  isConnected: boolean;
  showDebug: boolean;
  theme: 'light' | 'dark';
  setCurrentOrchestratorId: (id: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsConnected: (isConnected: boolean) => void;
  setShowDebug: (show: boolean) => void;
  toggleShowDebug: () => void;
  toggleTheme: () => void;
  getMessagesForCurrentOrchestrator: () => Message[];
  addLoadingMessage: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      currentOrchestratorId: '',
      messages: [],
      isConnected: false,
      showDebug: false,
      theme: 'dark',
      setCurrentOrchestratorId: (id: string) => set({ currentOrchestratorId: id }),
      setMessages: (messages: Message[]) => set({ messages }),
      addMessage: (message: Message) => set((state) => {
        if (message.type === 'response') {
          return {
            messages: state.messages
              .filter(msg => !msg.isLoading)
              .concat(message)
          };
        }
        return { 
          messages: [...state.messages, message] 
        };
      }),
      setIsConnected: (isConnected: boolean) => set({ isConnected }),
      setShowDebug: (show: boolean) => set({ showDebug: show }),
      toggleShowDebug: () => set((state) => ({ showDebug: !state.showDebug })),
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        set({ theme: newTheme });
      },
      getMessagesForCurrentOrchestrator: () => {
        const state = get();
        return state.messages.filter(msg => 
          msg.orchestratorId === state.currentOrchestratorId ||
          msg.type === 'welcome' || 
          msg.type === 'orchestrators_list'
        );
      },
      addLoadingMessage: () => set((state) => ({
        messages: [...state.messages, {
          type: 'response',
          isLoading: true,
          orchestratorId: state.currentOrchestratorId,
          timestamp: Date.now()
        }]
      })),
    }),
    {
      name: 'App Store'
    }
  )
) 