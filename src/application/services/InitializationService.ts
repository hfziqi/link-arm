import { initResourceManager } from '../init'
import { errorBuilders } from '../../domains/shared/utils/errorHelpers'

export interface InitializationCallbacks {
  onConversationSelected?: (conversationId: string) => void
}

export class InitializationService {
  private isInitialized = false
  private isToolsInitialized = false

  async initializeApp(
    _callbacks: InitializationCallbacks
  ): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      initResourceManager()
      await this.initializeTools()
      this.isInitialized = true
    } catch (error) {
      console.error('Initialization failed:', error)
      throw error
    }
  }

  async initializeTools(): Promise<void> {
    if (this.isToolsInitialized) {
      return
    }
    this.isToolsInitialized = true
  }

  async handleConversationChange(
    conversationId: string | null | undefined,
    loadMessages: (conversationId: string) => void
  ): Promise<void> {
    if (conversationId) {
      try {
        loadMessages(conversationId)
      } catch (error) {
        errorBuilders.application.initializationFailed(error, 'handleConversationChange')
      }
    }
  }
}

export const initializationService = new InitializationService()
