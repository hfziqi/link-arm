import { useCallback } from 'react'
import { Message } from '../types/chat.types'
import { generatePrefixedId } from '../../shared/utils/common'
import { handleError } from '../../shared/services/errorHandlingService'

export interface ChatSendParams {
  inputValue: string
  setInputValue: (value: string) => void
  setLoading: (loading: boolean) => void
  createConversation: () => Promise<void>
  activeConversationId: string | null
  addMessage: (conversationId: string, message: Omit<Message, 'conversationId'>) => void
}

export interface ChatSendResult {
  conversationId: string
  messageContent: string
}

export function useChatSend() {
  const sendInput = useCallback(async (params: ChatSendParams): Promise<ChatSendResult> => {
    const {
      inputValue,
      setInputValue,
      setLoading,
      createConversation,
      activeConversationId,
      addMessage
    } = params

    try {
      setLoading(true)

      if (!inputValue.trim()) {
        throw new Error('Input content cannot be empty')
      }

      const messageToSend = inputValue.trim()
      setInputValue('')

      let conversationIdToSend = activeConversationId

      if (!conversationIdToSend) {
        await createConversation()
        const { useChatStore } = await import('../../../stores/chat.store')
        conversationIdToSend = useChatStore.getState().activeConversationId
      }

      if (!conversationIdToSend) {
        throw new Error('Failed to get or create conversation')
      }

      const userMessage = {
        id: generatePrefixedId('msg'),
        role: 'user' as const,
        content: messageToSend,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'sent' as const,
        isTemp: false
      }

      addMessage(conversationIdToSend, userMessage)
      await new Promise(resolve => setTimeout(resolve, 100))

      return {
        conversationId: conversationIdToSend,
        messageContent: messageToSend
      }

    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useChatSend', action: 'sendInput' } })
      throw error
    }
  }, [])

  return {
    sendInput
  }
}
