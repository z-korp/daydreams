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
  setCurrentOrchestratorId: (id: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsConnected: (isConnected: boolean) => void;
  getMessagesForCurrentOrchestrator: () => Message[];
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      currentOrchestratorId: '',
      messages: [],
      isConnected: false,
      setCurrentOrchestratorId: (id) => set({ currentOrchestratorId: id }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      setIsConnected: (isConnected) => set({ isConnected }),
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