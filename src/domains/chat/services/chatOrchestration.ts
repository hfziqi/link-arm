import { conversationStorage } from './conversationStorage'
import { messageStorage } from './messageStorage'
import { Message } from '../types/chat.types'
import { handleError } from '../../shared/services/errorHandlingService'

export class ChatOrchestration {
  async addMessage(conversationId: string, message: Omit<Message, 'conversationId'>): Promise<Message> {
    try {
      const fullMessage = await messageStorage.addMessage(conversationId, message)

      const conversations = await conversationStorage.loadConversations()
      const convIndex = conversations.findIndex(conv => conv.id === conversationId)
      if (convIndex !== -1) {
        const existingConv = conversations[convIndex]
        const messages = await messageStorage.loadMessages(conversationId)

        conversations[convIndex] = {
          ...existingConv,
          messageCount: messages.length,
          lastMessagePreview: fullMessage.content.substring(0, 50),
          updatedAt: new Date()
        }
        await conversationStorage.saveConversations(conversations)
      }

      return fullMessage
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ChatOrchestration', action: 'addMessage' } })
      throw error
    }
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<boolean> {
    try {
      const success = await messageStorage.deleteMessage(conversationId, messageId)
      if (!success) return false

      const conversations = await conversationStorage.loadConversations()
      const convIndex = conversations.findIndex(conv => conv.id === conversationId)
      if (convIndex !== -1) {
        const existingConv = conversations[convIndex]
        const messages = await messageStorage.loadMessages(conversationId)

        conversations[convIndex] = {
          ...existingConv,
          messageCount: messages.length,
          lastMessagePreview: messages.length > 0
            ? messages[messages.length - 1].content.substring(0, 50)
            : undefined,
          updatedAt: new Date()
        }
        await conversationStorage.saveConversations(conversations)
      }

      return true
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ChatOrchestration', action: 'deleteMessage' } })
      throw error
    }
  }

  async clearMessages(conversationId: string): Promise<void> {
    try {
      await messageStorage.clearMessages(conversationId)

      const conversations = await conversationStorage.loadConversations()
      const convIndex = conversations.findIndex(conv => conv.id === conversationId)
      if (convIndex !== -1) {
        const existingConv = conversations[convIndex]
        conversations[convIndex] = {
          ...existingConv,
          messageCount: 0,
          lastMessagePreview: undefined,
          updatedAt: new Date()
        }
        await conversationStorage.saveConversations(conversations)
      }
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ChatOrchestration', action: 'clearMessages' } })
      throw error
    }
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      await conversationStorage.deleteConversation(conversationId)
      await messageStorage.clearMessages(conversationId)

      return true
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ChatOrchestration', action: 'deleteConversation' } })
      throw error
    }
  }

  async clearAll(): Promise<void> {
    try {
      const conversations = await conversationStorage.loadConversations()

      for (const conv of conversations) {
        await messageStorage.clearMessages(conv.id)
      }

      await conversationStorage.saveConversations([])
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ChatOrchestration', action: 'clearAll' } })
      throw error
    }
  }
}

let instance: ChatOrchestration | null = null

export function getChatOrchestration(): ChatOrchestration {
  if (!instance) {
    instance = new ChatOrchestration()
  }
  return instance
}

export const chatOrchestration = getChatOrchestration()
