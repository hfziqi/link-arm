import type { Message } from '../types/chat.types'
import type { MergedMessage } from '../types/mergedMessage.types'
import { createLogger } from '../../shared/utils/logger'

const logger = createLogger('MessageMerger')

export class MessageMerger {
  merge(messages: Message[]): MergedMessage[] {
    const filteredMessages = messages.filter(msg => msg.role !== 'tool')
    logger.debug('Original messages:', messages.length, 'After filter:', filteredMessages.length)
    const merged = this.mergeConsecutiveMessages(filteredMessages)
    logger.debug('After merge:', merged.length)
    return merged
  }

  private mergeConsecutiveMessages(messages: Message[]): MergedMessage[] {
    const merged: MergedMessage[] = []
    let currentGroup: Message[] = []

    for (const msg of messages) {
      const isSameRole = currentGroup.length > 0 &&
                        msg.role === currentGroup[0].role

      const isStreaming = msg._isStreaming === true
      const isGroupStreaming = currentGroup.some(m => m._isStreaming === true)

      const isStreamProcess = msg._skipLocalStorage === true
      const isGroupStreamProcess = currentGroup.some(m => m._skipLocalStorage === true)

      if (isStreaming || isGroupStreaming || isStreamProcess || isGroupStreamProcess) {
        if (currentGroup.length > 0) {
          merged.push(this.mergeGroup(currentGroup))
          currentGroup = []
        }
        merged.push({
          ...msg,
          isMerged: false
        })
      } else if (isSameRole) {
        currentGroup.push(msg)
      } else {
        if (currentGroup.length > 0) {
          merged.push(this.mergeGroup(currentGroup))
        }
        currentGroup = [msg]
      }
    }

    if (currentGroup.length > 0) {
      merged.push(this.mergeGroup(currentGroup))
    }

    return merged
  }

  private mergeGroup(group: Message[]): MergedMessage {
    if (group.length === 1) {
      const msg = group[0]
      logger.debug('Single message merge:', { id: msg.id, role: msg.role })
      return {
        ...msg,
        isMerged: false
      }
    }

    const firstMessage = group[0]
    const lastMessage = group[group.length - 1]

    const reasoningContents = group.map(m => m.reasoningContent).filter(c => c)
    const mergedReasoning = reasoningContents.length > 0
      ? reasoningContents.join('\n\n')
      : undefined

    const contents = group.map(m => m.content).filter(c => c)
    const mergedContent = contents.join('\n\n')

    const allToolCalls = group.flatMap(m => m.tool_calls || [])
    const allAttachments = group.flatMap(m => m.attachments || [])

    logger.debug('Multiple messages merge:', { groupCount: group.length, firstId: firstMessage.id, lastId: lastMessage.id })

    return {
      ...firstMessage,
      content: mergedContent,
      reasoningContent: mergedReasoning,
      tool_calls: allToolCalls.length > 0 ? allToolCalls : undefined,
      attachments: allAttachments.length > 0 ? allAttachments : undefined,
      isMerged: true,
      originalMessageIds: group.map(m => m.id),
      updatedAt: lastMessage.updatedAt
    }
  }

  split(mergedMessage: MergedMessage): Message[] {
    if (!mergedMessage.isMerged || !mergedMessage.originalMessageIds) {
      return [mergedMessage]
    }

    return [mergedMessage]
  }
}

export const messageMerger = new MessageMerger()
