import { useMemo, useCallback } from 'react'
import type { Message } from '../../domains/chat/types/chat.types'

export interface MessageGroup {
  id: string
  role: 'user' | 'assistant'
  content: string
  modelId?: string
  reasoningContent?: string
  toolCalls?: Array<{
    id: string
    type: string
    function: {
      name: string
      arguments: string
    }
    result?: string
  }>
  originalMessages: Message[]
  isStreaming?: boolean
}

function groupMessagesForDisplay(messages: Message[]): MessageGroup[] {
  if (!messages || messages.length === 0) return []

  const groups: MessageGroup[] = []
  let currentGroup: MessageGroup | null = null
  let isInToolCallChain = false

  for (const message of messages) {
    if (message.role === 'user') {
      if (currentGroup) {
        groups.push(currentGroup)
        currentGroup = null
      }
      isInToolCallChain = false
      
      groups.push({
        id: message.id,
        role: 'user',
        content: message.content,
        modelId: message.modelId,
        reasoningContent: message.reasoningContent,
        originalMessages: [message],
        isStreaming: message._isStreaming
      })
    } else if (message.role === 'assistant') {
      const hasToolCalls = message.tool_calls && message.tool_calls.length > 0
      
      if (isInToolCallChain && currentGroup) {
        if (message.content) {
          currentGroup.content = currentGroup.content 
            ? currentGroup.content + '\n\n---\n\n' + message.content
            : message.content
        }
        
        if (message.reasoningContent) {
          currentGroup.reasoningContent = currentGroup.reasoningContent 
            ? currentGroup.reasoningContent + '\n\n---\n\n' + message.reasoningContent
            : message.reasoningContent
        }
        
        if (hasToolCalls) {
          const newToolCalls = message.tool_calls!.map(tc => ({
            ...tc,
            result: undefined
          }))
          currentGroup.toolCalls = [...(currentGroup.toolCalls || []), ...newToolCalls]
        }
        
        currentGroup.originalMessages.push(message)
        currentGroup.isStreaming = message._isStreaming
        
        if (!hasToolCalls) {
          isInToolCallChain = false
        }
      } else {
        if (currentGroup) {
          groups.push(currentGroup)
        }
        
        isInToolCallChain = !!hasToolCalls
        
        currentGroup = {
          id: message.id,
          role: 'assistant',
          content: message.content,
          modelId: message.modelId,
          reasoningContent: message.reasoningContent,
          toolCalls: hasToolCalls ? message.tool_calls!.map(tc => ({
            ...tc,
            result: undefined
          })) : undefined,
          originalMessages: [message],
          isStreaming: message._isStreaming
        }
      }
    } else if (message.role === 'tool') {
      if (currentGroup && message.tool_call_id) {
        const toolCall = currentGroup.toolCalls?.find(tc => tc.id === message.tool_call_id)
        if (toolCall) {
          toolCall.result = message.content
        }
        currentGroup.originalMessages.push(message)
      }
    }
  }

  if (currentGroup) {
    groups.push(currentGroup)
  }

  return groups
}

export function useMessageOperations() {
  const processMessages = useCallback((messages: Message[]): MessageGroup[] => {
    if (!messages || messages.length === 0) return []
    return groupMessagesForDisplay(messages)
  }, [])

  return {
    processMessages
  }
}

export function useMergedMessages(rawMessages: Message[]): MessageGroup[] {
  const { processMessages } = useMessageOperations()

  return useMemo(() => {
    return processMessages(rawMessages)
  }, [rawMessages, processMessages])
}
