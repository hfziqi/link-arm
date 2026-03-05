import type { MessageSource } from '../core/memory/types/memory.types'

export type CollaborationEventType =
  | 'intent_analyzed'
  | 'decision_made'
  | 'submodel_called'
  | 'tool_executing'
  | 'tool_completed'
  | 'submodel_completed'
  | 'submodel_failed'
  | 'result_evaluated'
  | 'fallback_triggered'
  | 'response_generating'

export type CollaborationEventStatus = 'running' | 'completed' | 'failed'

export interface CollaborationEvent {
  id: string
  type: CollaborationEventType
  status: CollaborationEventStatus
  title: string
  description: string
  actor: MessageSource
  startTime: number
  endTime?: number
  duration?: number
  details?: Record<string, any>
  parentId?: string
  childrenIds?: string[]
}

export interface CollaborationSession {
  id: string
  userInput: string
  events: CollaborationEvent[]
  startTime: number
  endTime?: number
  status: 'running' | 'completed' | 'failed'
}

export interface CollaborationPanelState {
  currentSession?: CollaborationSession
  historySessions: CollaborationSession[]
  isExpanded: boolean
  selectedEventId?: string
}

export type CollaborationEventListener = (event: CollaborationEvent) => void
