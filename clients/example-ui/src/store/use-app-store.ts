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

interface Character {
  name: string;
  bio: string;
  traits: Array<{
    name: string;
    description: string;
    strength: number;
    examples: string[];
  }>;
  voice: {
    tone: string;
    style: string;
    vocabulary: string[];
    commonPhrases: string[];
    emojis: string[];
  };
  instructions: {
    goals: string[];
    constraints: string[];
    topics: string[];
    responseStyle: string[];
    contextRules: string[];
  };
  templates?: {
    tweetTemplate?: string;
  };
}

interface AppState {
  currentOrchestratorId: string;
  messages: Message[];
  isConnected: boolean;
  showDebug: boolean;
  theme: 'light' | 'dark';
  characters: Character[];
  currentCharacter: Character | null;
  setCurrentOrchestratorId: (id: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsConnected: (isConnected: boolean) => void;
  setShowDebug: (show: boolean) => void;
  toggleShowDebug: () => void;
  toggleTheme: () => void;
  getMessagesForCurrentOrchestrator: () => Message[];
  addLoadingMessage: () => void;
  addCharacter: (character: Character) => void;
  setCurrentCharacter: (character: Character | null) => void;
  removeCharacter: (name: string) => void;
  updateCharacter: (name: string, character: Partial<Character>) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      currentOrchestratorId: '',
      messages: [],
      isConnected: false,
      showDebug: false,
      theme: 'dark',
      characters: [],
      currentCharacter: null,
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
      addCharacter: (character: Character) => set((state) => ({
        characters: [...state.characters, character]
      })),
      setCurrentCharacter: (character: Character | null) => set({
        currentCharacter: character
      }),
      removeCharacter: (name: string) => set((state) => ({
        characters: state.characters.filter(c => c.name !== name),
        currentCharacter: state.currentCharacter?.name === name ? null : state.currentCharacter
      })),
      updateCharacter: (name: string, updates: Partial<Character>) => set((state) => ({
        characters: state.characters.map(c => 
          c.name === name ? { ...c, ...updates } : c
        ),
        currentCharacter: state.currentCharacter?.name === name 
          ? { ...state.currentCharacter, ...updates }
          : state.currentCharacter
      })),
    }),
    {
      name: 'App Store'
    }
  )
) 