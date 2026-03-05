import { useCallback } from 'react'
import { useChatStore } from '../../../stores/chat.store'
import type { Conversation } from '../types/chat.types'

export interface ConversationState {
  conversations: Conversation[]
  activeConversationId: string | null
}

export interface ConversationActions {
  loadConversations: () => Promise<void>
  createConversation: () => Promise<void>
  renameConversation: (conversationId: string, newTitle: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<void>
  selectConversation: (conversationId: string) => void
}

export function useConversationState(): ConversationState & ConversationActions {
  const conversations = useChatStore((state) => state.conversations)
  const activeConversationId = useChatStore((state) => state.activeConversationId)

  const storeLoadConversations = useChatStore((state) => state.loadConversations)
  const storeCreateConversation = useChatStore((state) => state.createConversation)
  const storeRenameConversation = useChatStore((state) => state.renameConversation)
  const storeDeleteConversation = useChatStore((state) => state.deleteConversation)
  const storeSelectConversation = useChatStore((state) => state.selectConversation)

  const loadConversations = useCallback(async () => {
    return storeLoadConversations()
  }, [storeLoadConversations])

  const createConversation = useCallback(async () => {
    return storeCreateConversation()
  }, [storeCreateConversation])

  const renameConversation = useCallback(
    async (conversationId: string, newTitle: string) => {
      return storeRenameConversation(conversationId, newTitle)
    },
    [storeRenameConversation]
  )

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      return storeDeleteConversation(conversationId)
    },
    [storeDeleteConversation]
  )

  const selectConversation = useCallback(
    (conversationId: string) => {
      return storeSelectConversation(conversationId)
    },
    [storeSelectConversation]
  )

  return {
    conversations,
    activeConversationId,
    loadConversations,
    createConversation,
    renameConversation,
    deleteConversation,
    selectConversation,
  }
}
