import { createFileRoute } from '@tanstack/react-router'
import ChatList from '@/components/chat-list'

export const Route = createFileRoute('/my-agents/chats/')({
  component: ChatList,
})
