import React, { useState } from 'react';
import { Message, AppState } from '@/types';

const MESSAGE_TYPES = {
  STATE: 'state',
  WELCOME: 'welcome',
  USER: 'user',
  DEBUG: 'debug',
  RESPONSE: 'response'
} as const;

interface DebugPanelProps {
  messages: Message[];
  state: AppState;
}

export function DebugPanel({ messages, state }: DebugPanelProps) {
  // ... your DebugPanel code ...
} 