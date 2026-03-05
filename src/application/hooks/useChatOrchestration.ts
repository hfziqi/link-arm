import { useCallback } from 'react'
import { useChatFlow } from '../../domains/chat/hooks/useChatFlow'
import { unifiedAgentOrchestrator } from '../services/unifiedAgentOrchestrator'
import { useChatStore } from '../../stores/chat.store'
import { modelOrchestration } from '../../domains/models/services/modelOrchestration'
import type { Message } from '../../domains/chat/types/chat.types'

export interface ProcessMessageParams {
  conversationId: string
  messageContent: string
  modelId: string
  addMessage: (conversationId: string, message: Omit<Message, 'conversationId'>) => void
  replaceMessage: (conversationId: string, messageId: string, message: Omit<Message, 'conversationId'> | null) => void
}

export interface ProcessMessageResult {
  success: boolean
}

export function useChatOrchestration() {
  const { createAIMessage } = useChatFlow()
  const getMessages = useChatStore((state) => state.getMessages)

  const processMessage = useCallback(async (params: ProcessMessageParams): Promise<ProcessMessageResult> => {
    const { conversationId, messageContent, modelId, addMessage, replaceMessage } = params

    const mainModel = await modelOrchestration.getSelectedModel()
    if (!mainModel) {
      throw new Error('Please add a model first. Click the model icon in the sidebar to add your AI model.')
    }

    const allMessages = getMessages(conversationId)
    const historyMessages = allMessages
      .filter((msg: Message) => !msg.isTemp)
      .map((msg: Message) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

    const aiMessageId = createAIMessage({
      conversationId,
      modelId,
      addMessage
    })

    await unifiedAgentOrchestrator.process({
      conversationId,
      messageContent,
      modelId,
      aiMessageId,
      replaceMessage,
      addMessage,
      historyMessages
    })

    return { success: true }
  }, [createAIMessage])

  return {
    processMessage
  }
}
