import { createLogger } from '../../../../shared/utils/logger'
import type { AGIMessage, MessageSource, BaseStoreConfig } from '../types/memory.types'
import type { ToolCall } from '../../../../shared/types/tool.types'

const logger = createLogger('MessageStore')

export class MessageStore {
  private messages: AGIMessage[] = []
  private config: Required<BaseStoreConfig>

  constructor(config: BaseStoreConfig = {}) {
    this.config = {
      maxItems: config.maxItems || 100,
      maxContentLength: config.maxContentLength || 10000
    }
  }

  addSystemMessage(content: string, source: MessageSource): void {
    this.addMessage({
      role: 'system',
      content: this.truncateContent(content),
      source,
      timestamp: Date.now()
    })
  }

  addUserMessage(content: string, source: MessageSource): void {
    this.addMessage({
      role: 'user',
      content: this.truncateContent(content),
      source,
      timestamp: Date.now()
    })
  }

  addAssistantMessage(
    content: string,
    source: MessageSource,
    toolCalls?: ToolCall[]
  ): void {
    const message: AGIMessage = {
      role: 'assistant',
      content: this.truncateContent(content),
      source,
      toolCalls,
      timestamp: Date.now()
    }
    this.addMessage(message)
  }

  addToolResult(
    toolCallId: string,
    result: string,
    source: MessageSource
  ): void {
    this.addMessage({
      role: 'tool',
      content: this.truncateContent(result),
      source,
      toolCallId,
      timestamp: Date.now()
    })
  }

  getMessages(): AGIMessage[] {
    return [...this.messages]
  }

  getMessagesForModel(): Array<{
    role: 'system' | 'user' | 'assistant' | 'tool'
    content: string
    tool_call_id?: string
    tool_calls?: ToolCall[]
  }> {
    return this.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      tool_call_id: msg.toolCallId,
      tool_calls: msg.toolCalls
    }))
  }

  clear(): void {
    this.messages = []
    logger.info('[MessageStore] Cleared')
  }

  getStats(): { count: number; totalLength: number } {
    const totalLength = this.messages.reduce((sum, msg) => {
      let len = msg.content?.length || 0
      if (msg.toolCalls) {
        len += msg.toolCalls.reduce((s, tc) => s + tc.function.arguments.length, 0)
      }
      return sum + len
    }, 0)

    return {
      count: this.messages.length,
      totalLength
    }
  }

  private addMessage(message: AGIMessage): void {
    this.messages.push(message)

    if (this.messages.length > this.config.maxItems) {
      this.truncateMessages()
    }
  }

  private truncateMessages(): void {
    const systemMessages = this.messages.filter(m => m.role === 'system')
    const otherMessages = this.messages.filter(m => m.role !== 'system')

    const keepCount = this.config.maxItems - systemMessages.length
    const truncatedOther = otherMessages.slice(-keepCount)

    this.messages = [...systemMessages, ...truncatedOther]
    logger.info(`[MessageStore] Messages truncated, kept ${this.messages.length} messages`)
  }

  private truncateContent(content: string): string {
    if (content.length <= this.config.maxContentLength) return content
    return content.slice(0, this.config.maxContentLength) + '\n...[Truncated]'
  }
}
