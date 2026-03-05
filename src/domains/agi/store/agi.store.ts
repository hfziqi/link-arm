import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { CollaborationEvent, CollaborationEventType, CollaborationEventStatus } from '../types/collaboration.types'
import type { ModelAction, ModelActionType } from '../core/memory/types/memory.types'

export interface AGISession {
  messageId: string
  conversationId?: string
  userInput?: string
  events: CollaborationEvent[]
  startTime: number
  endTime?: number
  status: 'running' | 'completed' | 'failed'
  error?: string
  currentEventId?: string
}

export interface CreateSessionOptions {
  conversationId?: string
  userInput?: string
  mainModel?: {
    id: string
    name: string
  }
}

interface AGIState {
  sessions: Record<string, AGISession>
}

interface AGIActions {
  createSession: (messageId: string, options?: CreateSessionOptions) => void
  getSession: (messageId: string) => AGISession | undefined
  clearSession: (messageId: string) => void

  addEvent: (messageId: string, event: Omit<CollaborationEvent, 'id' | 'startTime'>) => string
  updateEvent: (messageId: string, eventId: string, updates: Partial<CollaborationEvent>) => void
  completeEvent: (messageId: string, eventId: string, details?: Record<string, any>) => void
  failEvent: (messageId: string, eventId: string, error: string) => void

  completeSession: (messageId: string) => void
  failSession: (messageId: string, error: string) => void

  syncFromMemory: (messageId: string, actions: ModelAction[]) => void
}

export type AGIStore = AGIState & AGIActions

let eventCounter = 0
function generateEventId(): string {
  return `event_${Date.now()}_${++eventCounter}`
}

export const useAGIStore = create<AGIStore>()(
  devtools(
    (set, get) => ({
      sessions: {},

      createSession: (messageId: string, options?: CreateSessionOptions) => {
        set((state) => {
          if (state.sessions[messageId]) {
            return state
          }
          return {
            sessions: {
              ...state.sessions,
              [messageId]: {
                messageId,
                conversationId: options?.conversationId,
                userInput: options?.userInput,
                events: [],
                startTime: Date.now(),
                status: 'running'
              }
            }
          }
        }, false, 'agi/createSession')
      },

      getSession: (messageId: string) => {
        return get().sessions[messageId]
      },

      clearSession: (messageId: string) => {
        set((state) => {
          const { [messageId]: _, ...rest } = state.sessions
          return { sessions: rest }
        }, false, 'agi/clearSession')
      },

      addEvent: (messageId: string, eventData: Omit<CollaborationEvent, 'id' | 'startTime'>): string => {
        const eventId = generateEventId()
        const event: CollaborationEvent = {
          ...eventData,
          id: eventId,
          startTime: Date.now()
        }

        set((state) => {
          const session = state.sessions[messageId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [messageId]: {
                ...session,
                events: [...session.events, event],
                currentEventId: eventId
              }
            }
          }
        }, false, 'agi/addEvent')

        return eventId
      },

      updateEvent: (messageId: string, eventId: string, updates: Partial<CollaborationEvent>) => {
        set((state) => {
          const session = state.sessions[messageId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [messageId]: {
                ...session,
                events: session.events.map(e =>
                  e.id === eventId ? { ...e, ...updates } : e
                )
              }
            }
          }
        }, false, 'agi/updateEvent')
      },

      completeEvent: (messageId: string, eventId: string, details?: Record<string, any>) => {
        set((state) => {
          const session = state.sessions[messageId]
          if (!session) return state

          const now = Date.now()
          return {
            sessions: {
              ...state.sessions,
              [messageId]: {
                ...session,
                events: session.events.map(e => {
                  if (e.id === eventId) {
                    return {
                      ...e,
                      status: 'completed' as CollaborationEventStatus,
                      endTime: now,
                      duration: now - e.startTime,
                      ...(details && { details: { ...e.details, ...details } })
                    }
                  }
                  return e
                })
              }
            }
          }
        }, false, 'agi/completeEvent')
      },

      failEvent: (messageId: string, eventId: string, error: string) => {
        set((state) => {
          const session = state.sessions[messageId]
          if (!session) return state

          const now = Date.now()
          return {
            sessions: {
              ...state.sessions,
              [messageId]: {
                ...session,
                events: session.events.map(e => {
                  if (e.id === eventId) {
                    return {
                      ...e,
                      status: 'failed' as CollaborationEventStatus,
                      endTime: now,
                      duration: now - e.startTime,
                      details: { ...e.details, error }
                    }
                  }
                  return e
                })
              }
            }
          }
        }, false, 'agi/failEvent')
      },

      completeSession: (messageId: string) => {
        set((state) => {
          const session = state.sessions[messageId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [messageId]: {
                ...session,
                status: 'completed',
                endTime: Date.now(),
                currentEventId: undefined
              }
            }
          }
        }, false, 'agi/completeSession')
      },

      failSession: (messageId: string, error: string) => {
        set((state) => {
          const session = state.sessions[messageId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [messageId]: {
                ...session,
                status: 'failed',
                endTime: Date.now(),
                error,
                currentEventId: undefined
              }
            }
          }
        }, false, 'agi/failSession')
      },

      syncFromMemory: (messageId: string, actions: ModelAction[]) => {
        set((state) => {
          const session = state.sessions[messageId]
          if (!session) return state

          const actionToEventType: Partial<Record<ModelActionType, CollaborationEventType>> = {
            'analyze_intent': 'intent_analyzed',
            'make_decision': 'decision_made',
            'call_submodel': 'submodel_called',
            'call_tool': 'tool_executing',
            'complete_task': 'submodel_completed',
            'fail_task': 'submodel_failed',
            'fallback': 'fallback_triggered',
            'main_model_thinking': 'response_generating',
            'process_tool_result': 'tool_completed',
            'submodel_start': 'submodel_called',
            'tool_call_start': 'tool_executing',
            'tool_call_result': 'tool_completed',
            'submodel_complete': 'submodel_completed',
            'receive_task': 'submodel_called',
            'evaluate_result': 'result_evaluated',
            'reflect': 'decision_made'
          }

          const existingEventIds = new Set(session.events.map(e => e.id))
          const newEvents: CollaborationEvent[] = []
          const updatedEvents = [...session.events]

          const subModelParentMap = new Map<string, string>()

          for (const action of actions) {
            const eventType = actionToEventType[action.actionType]
            if (!eventType) continue

            const status: CollaborationEventStatus = action.status === 'running' ? 'running' :
                                                    action.status === 'failed' ? 'failed' : 'completed'

            const eventData = {
              type: eventType,
              status,
              title: action.description,
              description: action.output || action.input || '',
              actor: action.source,
              details: {
                ...action.metadata,
                actionType: action.actionType
              }
            }

            if (existingEventIds.has(action.id)) {
              const existingIndex = updatedEvents.findIndex(e => e.id === action.id)
              if (existingIndex >= 0) {
                updatedEvents[existingIndex] = {
                  ...updatedEvents[existingIndex],
                  ...eventData
                }
              }
            } else {
              let parentId: string | undefined

              if (action.source.type === 'sub') {
                parentId = subModelParentMap.get(action.source.modelId)
              }

              const newEvent: CollaborationEvent = {
                id: action.id,
                ...eventData,
                startTime: action.timestamp,
                parentId
              }

              newEvents.push(newEvent)

              if (action.actionType === 'call_submodel' && action.metadata?.targetModelId) {
                subModelParentMap.set(action.metadata.targetModelId, action.id)
              }

              if (parentId) {
                const parentEvent = updatedEvents.find(e => e.id === parentId) ||
                                   newEvents.find(e => e.id === parentId)
                if (parentEvent) {
                  parentEvent.childrenIds = parentEvent.childrenIds || []
                  if (!parentEvent.childrenIds.includes(action.id)) {
                    parentEvent.childrenIds.push(action.id)
                  }
                }
              }
            }
          }

          const allEvents = [...updatedEvents, ...newEvents]

          return {
            sessions: {
              ...state.sessions,
              [messageId]: {
                ...session,
                events: allEvents,
                currentEventId: allEvents[allEvents.length - 1]?.id
              }
            }
          }
        }, false, 'agi/syncFromMemory')
      }
    }),
    { name: 'AGIStore' }
  )
)

export function useAGISession(messageId: string): AGISession | undefined {
  return useAGIStore(state => state.sessions[messageId])
}

export function useIsAGISessionActive(messageId: string): boolean {
  return useAGIStore(state => {
    const session = state.sessions[messageId]
    return session?.status === 'running'
  })
}
