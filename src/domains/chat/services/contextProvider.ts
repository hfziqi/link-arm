import { messageStorage } from './messageStorage'
import { messageBuilder } from './messageBuilder'

export class ContextProvider {
  async getConversationContext(
    conversationId: string,
    inputValue: string
  ): Promise<any[]> {
    const messages = await messageStorage.loadRawMessages(conversationId)
    return messageBuilder.buildChatMessages(messages, inputValue)
  }
}

export const contextProvider = new ContextProvider()
