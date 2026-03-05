import { BaseRepository } from '../../../infrastructure/repository/BaseRepository'
import { generatePrefixedId } from '../../shared/utils/common'
import { Conversation } from '../types/chat.types'
import { handleError } from '../../shared/services/errorHandlingService'

export class ConversationRepository extends BaseRepository<Conversation> {
  protected getStoragePath(): string {
    return 'chat'
  }

  protected getTableName(): string {
    return 'conversations.json'
  }

  async create(title: string): Promise<Conversation | null> {
    try {
      const conversations = await this.findAll()
      const newConversation: Conversation = {
        id: generatePrefixedId('conv'),
        title,
        messageCount: 0,
        lastMessagePreview: undefined,
        modelId: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const updatedConversations = [newConversation, ...conversations]
      await this.saveAll(updatedConversations)
      return newConversation
    } catch (error) {
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'ConversationRepository', action: 'create', title }
      })
      return null
    }
  }
}

export const conversationRepository = new ConversationRepository()
