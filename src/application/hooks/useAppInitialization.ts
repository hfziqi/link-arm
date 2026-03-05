import { useCallback } from 'react'
import { initializationService } from '../services/InitializationService'

interface UseAppInitializationParams {
  loadConversations: () => void
  refreshModels: () => void
  loadMessages: (conversationId: string) => void
  activeConversationId?: string | null
}

export function useAppInitialization(params: UseAppInitializationParams) {
  const {
    loadConversations,
    refreshModels,
    loadMessages,
    activeConversationId
  } = params

  const initializeApp = useCallback(async () => {
    await initializationService.initializeApp({})
    
    loadConversations()
    refreshModels()
  }, [loadConversations, refreshModels])

  const handleConversationChange = useCallback(async () => {
    if (activeConversationId !== undefined) {
      await initializationService.handleConversationChange(
        activeConversationId,
        loadMessages
      )
    }
  }, [activeConversationId, loadMessages])

  return {
    initializeApp,
    handleConversationChange
  }
}
