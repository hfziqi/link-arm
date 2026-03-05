import { useCallback, useMemo } from 'react'
import { useChatStore } from '../../../stores/chat.store'
import type { Message } from '../types/chat.types'

export interface MessageState {
  messagesByConversation: Record<string, Message[]>
  loading: boolean
  error: string | null
}

export interface MessageActions {
  addMessage: (conversationId: string, message: Omit<Message, 'conversationId'>) => Promise<void>
  replaceMessage: (
    conversationId: string,
    tempId: string,
    newMessage: Omit<Message, 'conversationId'> | null
  ) => Promise<void>
  updateMessageStatus: (
    conversationId: string,
    messageId: string,
    status: 'sending' | 'sent' | 'failed'
  ) => void
  clearMessages: (conversationId: string) => Promise<void>
  getMessages: (conversationId: string) => Message[]
  getMergedMessages: (conversationId: string) => Message[]
  loadMessages: (conversationId: string) => Promise<void>
  currentMessages: Message[]
  currentMergedMessages: Message[]
}

export function useMessageState(
  _conversationState?: { activeConversationId: string | null }
): MessageState & MessageActions {
  const messagesByConversation = useChatStore((state) => state.messagesByConversation)
  const loading = useChatStore((state) => state.loading)
  const error = useChatStore((state) => state.error)
  const activeConversationId = useChatStore((state) => state.activeConversationId)

  const storeAddMessage = useChatStore((state) => state.addMessage)
  const storeReplaceMessage = useChatStore((state) => state.replaceMessage)
  const storeUpdateMessageStatus = useChatStore((state) => state.updateMessageStatus)
  const storeClearMessages = useChatStore((state) => state.clearMessages)
  const storeGetMessages = useChatStore((state) => state.getMessages)
  const storeLoadMessages = useChatStore((state) => state.loadMessages)

  const addMessage = useCallback(
    async (conversationId: string, message: Omit<Message, 'conversationId'>) => {
      return storeAddMessage(conversationId, message)
    },
    [storeAddMessage]
  )

  const replaceMessage = useCallback(
    async (
      conversationId: string,
      tempId: string,
      newMessage: Omit<Message, 'conversationId'> | null
    ) => {
      return storeReplaceMessage(conversationId, tempId, newMessage)
    },
    [storeReplaceMessage]
  )

  const updateMessageStatus = useCallback(
    (
      conversationId: string,
      messageId: string,
      status: 'sending' | 'sent' | 'failed'
    ) => {
      return storeUpdateMessageStatus(conversationId, messageId, status)
    },
    [storeUpdateMessageStatus]
  )

  const clearMessages = useCallback(
    async (conversationId: string) => {
      return storeClearMessages(conversationId)
    },
    [storeClearMessages]
  )

  const getMessages = useCallback(
    (conversationId: string) => {
      return storeGetMessages(conversationId)
    },
    [storeGetMessages]
  )

  const getMergedMessages = useCallback(
    (conversationId: string): Message[] => {
      return storeGetMessages(conversationId)
    },
    [storeGetMessages]
  )

  const loadMessages = useCallback(
    async (conversationId: string) => {
      return storeLoadMessages(conversationId)
    },
    [storeLoadMessages]
  )

  const currentMessages = useMemo(() => {
    return activeConversationId
      ? messagesByConversation[activeConversationId] || []
      : []
  }, [messagesByConversation, activeConversationId])

  const currentMergedMessages = useMemo(() => {
    return activeConversationId
      ? messagesByConversation[activeConversationId] || []
      : []
  }, [activeConversationId, messagesByConversation])

  return {
    messagesByConversation,
    loading,
    error,
    addMessage,
    replaceMessage,
    updateMessageStatus,
    clearMessages,
    getMessages,
    getMergedMessages,
    loadMessages,
    currentMessages,
    currentMergedMessages,
  }
}
