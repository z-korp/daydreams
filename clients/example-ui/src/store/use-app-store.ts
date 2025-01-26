import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AppState {
  currentOrchestratorId: string
  messages: any[]
  isConnected: boolean
  setCurrentOrchestratorId: (id: string) => void
  setMessages: (messages: any[]) => void
  addMessage: (message: any) => void
  setIsConnected: (isConnected: boolean) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      currentOrchestratorId: '',
      messages: [],
      isConnected: false,
      setCurrentOrchestratorId: (id) => set({ currentOrchestratorId: id }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      setIsConnected: (isConnected) => set({ isConnected })
    }),
    {
      name: 'App Store'
    }
  )
) 