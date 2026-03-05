import { messageRepository } from '../repositories/MessageRepository'
import { Message } from '../types/chat.types'
import { generatePrefixedId } from '../../shared/utils/common'
import { errorBuilders } from '../../shared/utils/errorHelpers'

export class MessageStorage {
  async loadMessages(conversationId: string): Promise<Message[]> {
    try {
      const messages = await messageRepository.loadMessages(conversationId)
      if (!messages || !Array.isArray(messages)) return []
      return messages
    } catch (error) {
      errorBuilders.chat.messageStorageFailed(error, 'loadMessages')
      return []
    }
  }

  async loadRawMessages(conversationId: string): Promise<Message[]> {
    try {
      const messages = await messageRepository.loadMessages(conversationId)
      if (!messages || !Array.isArray(messages)) return []
      return messages
    } catch (error) {
      errorBuilders.chat.messageStorageFailed(error, 'loadRawMessages')
      return []
    }
  }

  async saveMessages(conversationId: string, messages: Message[]): Promise<void> {
    try {
      await messageRepository.saveMessages(conversationId, messages)
    } catch (error) {
      errorBuilders.chat.messageStorageFailed(error, 'saveMessages')
      throw error
    }
  }

  async addMessage(conversationId: string, message: Omit<Message, 'conversationId'>): Promise<Message> {
    try {
      const now = new Date()
      const fullMessage: Message = {
        ...message,
        conversationId,
        id: message.id || generatePrefixedId('msg'),
        status: message.status || 'sent',
        isTemp: false,
        createdAt: message.createdAt ? new Date(message.createdAt) : now,
        updatedAt: now
      }
      await messageRepository.addMessage(conversationId, fullMessage)
      return fullMessage
    } catch (error) {
      errorBuilders.chat.messageStorageFailed(error, 'addMessage')
      throw error
    }
  }

  async updateMessage(conversationId: string, messageId: string, updates: Partial<Message>): Promise<Message | null> {
    try {
      await messageRepository.updateMessage(conversationId, messageId, {
        ...updates,
        updatedAt: new Date()
      })
      return null
    } catch (error) {
      errorBuilders.chat.messageStorageFailed(error, 'updateMessage')
      throw error
    }
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<boolean> {
    try {
      await messageRepository.deleteMessage(conversationId, messageId)
      return true
    } catch (error) {
      errorBuilders.chat.messageStorageFailed(error, 'deleteMessage')
      throw error
    }
  }

  async clearMessages(conversationId: string): Promise<void> {
    try {
      await messageRepository.deleteAllMessages(conversationId)
    } catch (error) {
      errorBuilders.chat.messageStorageFailed(error, 'clearMessages')
      throw error
    }
  }
}

let instance: MessageStorage | null = null

export function getMessageStorage(): MessageStorage {
  if (!instance) {
    instance = new MessageStorage()
  }
  return instance
}

export const messageStorage = getMessageStorage()
