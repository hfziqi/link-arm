import { Message } from './chat.types'

export interface ToolCallGroup {
  toolCallMessageId: string
  toolResultMessageIds: string[]
}

export interface MergedMessage extends Message {
  isMerged: boolean
  originalMessageIds?: string[]
  mergeStrategy?: 'content' | 'tool'
  toolCallGroups?: ToolCallGroup[]
}
