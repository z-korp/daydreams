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
}

interface AppState {
  currentOrchestratorId: string;
  messages: Message[];
  isConnected: boolean;
  showDebug: boolean;
  setCurrentOrchestratorId: (id: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsConnected: (isConnected: boolean) => void;
  setShowDebug: (show: boolean) => void;
  toggleShowDebug: () => void;
  getMessagesForCurrentOrchestrator: () => Message[];
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      currentOrchestratorId: '',
      messages: [],
      isConnected: false,
      showDebug: false,
      setCurrentOrchestratorId: (id: string) => set({ currentOrchestratorId: id }),
      setMessages: (messages: Message[]) => set({ messages }),
      addMessage: (message: Message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      setIsConnected: (isConnected: boolean) => set({ isConnected }),
      setShowDebug: (show: boolean) => set({ showDebug: show }),
      toggleShowDebug: () => set((state) => ({ showDebug: !state.showDebug })),
      getMessagesForCurrentOrchestrator: () => {
        const state = get();
        return state.messages.filter(msg => 
          msg.orchestratorId === state.currentOrchestratorId ||
          msg.type === 'welcome' || 
          msg.type === 'orchestrators_list'
        );
      }
    }),
    {
      name: 'App Store'
    }
  )
) 