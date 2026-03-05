import { useCallback } from 'react'
import { useChatSend } from './useChatSend'
import { generatePrefixedId } from '../../shared/utils/common'
import { Message } from '../types/chat.types'
import { handleError } from '../../shared/services/errorHandlingService'
import { StreamMessageManager } from '../../../application/services/StreamMessageManager'

export interface ChatSendInputResult {
  conversationId: string
  messageContent: string
}

export interface CreateAIMessageParams {
  conversationId: string
  modelId: string
  addMessage: (conversationId: string, message: Omit<Message, 'conversationId'>) => void
}

export function useChatFlow() {
  const { sendInput } = useChatSend()

  const addUserMessage = useCallback(async (params: {
    inputValue: string
    setInputValue: (value: string) => void
    setLoading: (loading: boolean) => void
    createConversation: () => Promise<void>
    activeConversationId: string | null
    addMessage: (conversationId: string, message: Omit<Message, 'conversationId'>) => void
  }): Promise<ChatSendInputResult> => {
    const result = await sendInput(params)
    return {
      conversationId: result.conversationId,
      messageContent: result.messageContent
    }
  }, [sendInput])

  const createAIMessage = useCallback((params: CreateAIMessageParams): string => {
    const { conversationId, modelId, addMessage } = params

    const aiMessageId = generatePrefixedId('msg')
    
    StreamMessageManager.startStream(aiMessageId, modelId)
    
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant' as const,
      content: '',
      reasoningContent: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'sent' as const,
      isTemp: false,
      modelId,
      _isStreaming: true
    }

    addMessage(conversationId, aiMessage)

    return aiMessageId
  }, [])

  const addErrorMessage = useCallback((params: {
    activeConversationId: string | null
    addMessage: (conversationId: string, message: Omit<Message, 'conversationId'>) => void
    error: unknown
  }) => {
    const { activeConversationId, addMessage, error } = params

    const errorMessage = {
      id: `error_${Date.now()}`,
      role: 'assistant' as const,
      content: `Sorry, AI service is temporarily unavailable. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (activeConversationId) {
      addMessage(activeConversationId, errorMessage)
    }

    handleError(error, { showToast: false, logToConsole: true, context: { source: 'useChatFlow', action: 'addErrorMessage' } })
  }, [])

  return {
    addUserMessage,
    createAIMessage,
    addErrorMessage
  }
}
