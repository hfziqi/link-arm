import { Message, ApiMessage } from '../types/chat.types'

export class MessageBuilder {
  buildChatMessages(messages: Message[], currentMessage: string): ApiMessage[] {
    const formattedHistory: ApiMessage[] = messages
      .filter(msg => {
        if (msg.role === 'tool') return true
        if (msg.role === 'assistant' && msg.tool_calls) return true
        return msg?.role && msg.content?.trim()
      })
      .map((msg) => {
        const formatted: ApiMessage = {
          role: msg.role,
          content: msg.content,
        }
        if (msg.role === 'tool' && msg.tool_call_id) {
          formatted.tool_call_id = msg.tool_call_id
        }
        if (msg.role === 'assistant' && msg.tool_calls) {
          formatted.tool_calls = msg.tool_calls
        }
        if (msg.role === 'assistant' && msg.reasoningContent) {
          formatted.reasoning_content = msg.reasoningContent
        }
        return formatted
      })

    if (currentMessage && currentMessage.trim()) {
      formattedHistory.push({
        role: 'user',
        content: currentMessage,
      })
    }

    return formattedHistory
  }

  formatHistoryMessages(messages: Message[]): any[] {
    return messages
      .filter(msg => !(msg.role === 'assistant' && !msg.content.trim() && !msg.tool_calls))
      .map((msg) => {
        const formatted: any = { role: msg.role, content: msg.content }
        if (msg.role === 'assistant' && msg.tool_calls) {
          formatted.tool_calls = msg.tool_calls
        }
        if (msg.role === 'assistant' && msg.reasoningContent) {
          formatted.reasoning_content = msg.reasoningContent
        }
        if (msg.role === 'tool' && msg.tool_call_id) {
          formatted.tool_call_id = msg.tool_call_id
        }
        return formatted
      })
  }
}

export const messageBuilder = new MessageBuilder()
