import { conversationRepository } from '../repositories/ConversationRepository'
import { Conversation } from '../types/chat.types'
import { handleError } from '../../shared/services/errorHandlingService'

export class ConversationStorage {
  async loadConversations(): Promise<Conversation[]> {
    try {
      const conversations = await conversationRepository.findAll()
      return conversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt)
      }))
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ConversationStorage', action: 'loadConversations' } })
      return []
    }
  }

  async saveConversations(conversations: Conversation[]): Promise<void> {
    try {
      await conversationRepository.saveAll(conversations)
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ConversationStorage', action: 'saveConversations' } })
      throw error
    }
  }

  async createConversation(title: string): Promise<Conversation> {
    try {
      const newConversation = await conversationRepository.create(title)
      if (!newConversation) {
        throw new Error('Failed to create conversation')
      }
      return {
        ...newConversation,
        createdAt: new Date(newConversation.createdAt),
        updatedAt: new Date(newConversation.updatedAt)
      }
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ConversationStorage', action: 'createConversation' } })
      throw error
    }
  }

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation | null> {
    try {
      await conversationRepository.update(conversationId, {
        ...updates,
        updatedAt: new Date()
      })
      
      const updated = await conversationRepository.findById(conversationId)
      if (!updated) return null
      
      return {
        ...updated,
        createdAt: new Date(updated.createdAt),
        updatedAt: new Date(updated.updatedAt)
      }
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ConversationStorage', action: 'updateConversation' } })
      throw error
    }
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      await conversationRepository.delete(conversationId)
      return true
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ConversationStorage', action: 'deleteConversation' } })
      throw error
    }
  }
}

let instance: ConversationStorage | null = null

export function getConversationStorage(): ConversationStorage {
  if (!instance) {
    instance = new ConversationStorage()
  }
  return instance
}

export const conversationStorage = getConversationStorage()
