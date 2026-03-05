import { storageProvider } from '../../../infrastructure/storage/TauriStorageProvider'
import { StorageKeyBuilder } from '../../../infrastructure/repository/BaseRepository'
import { handleError } from '../../shared/services/errorHandlingService'
import type { Message } from '../types/chat.types'

export class MessageRepository {
  private basePath = 'chat/messages'
  private keyBuilder = new StorageKeyBuilder()

  private async getUserId(): Promise<string> {
    return this.keyBuilder.getUserId()
  }

  private async buildConversationDir(conversationId: string): Promise<string> {
    const userId = await this.getUserId()
    return `user_${userId}/${this.basePath}/${conversationId}`
  }

  private async buildMessagesKey(conversationId: string): Promise<string> {
    const dir = await this.buildConversationDir(conversationId)
    return `${dir}/messages.json`
  }

  async loadMessages(conversationId: string): Promise<Message[]> {
    try {
      const key = await this.buildMessagesKey(conversationId)
      const result = await storageProvider.loadRaw(key)
      if (!result) return []

      const messages = JSON.parse(result)
      return messages.map((msg: any) => ({
        ...msg,
        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        updatedAt: msg.updatedAt ? new Date(msg.updatedAt) : new Date()
      }))
    } catch (error) {
      handleError(error, {
        logToConsole: true
      })
      return []
    }
  }

  async saveMessages(conversationId: string, messages: Message[]): Promise<void> {
    try {
      const key = await this.buildMessagesKey(conversationId)
      await storageProvider.saveRaw(key, JSON.stringify(messages))
    } catch (error) {
      handleError(error, {
        logToConsole: true
      })
      throw error
    }
  }

  async addMessage(conversationId: string, message: Message): Promise<void> {
    const messages = await this.loadMessages(conversationId)
    messages.push(message)
    await this.saveMessages(conversationId, messages)
  }

  async updateMessage(conversationId: string, messageId: string, updates: Partial<Message>): Promise<void> {
    const messages = await this.loadMessages(conversationId)
    const index = messages.findIndex(msg => msg.id === messageId)
    if (index === -1) return

    messages[index] = {
      ...messages[index],
      ...updates,
      updatedAt: new Date()
    }
    await this.saveMessages(conversationId, messages)
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    const messages = await this.loadMessages(conversationId)
    const filteredMessages = messages.filter(msg => msg.id !== messageId)
    await this.saveMessages(conversationId, filteredMessages)
  }

  async deleteAllMessages(conversationId: string): Promise<void> {
    try {
      const dir = await this.buildConversationDir(conversationId)
      await storageProvider.deleteDirectory(dir)
    } catch (error) {
      handleError(error, {
        logToConsole: true
      })
      throw error
    }
  }
}

export const messageRepository = new MessageRepository()
