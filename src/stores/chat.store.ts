import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Conversation, Message } from '../domains/chat/types/chat.types'
import { conversationStorage } from '../domains/chat/services/conversationStorage'
import { messageStorage } from '../domains/chat/services/messageStorage'
import { chatOrchestration } from '../domains/chat/services/chatOrchestration'
import { generateId } from '../domains/shared/utils/common'

const debouncedSaveTimers = new Map<string, NodeJS.Timeout>()

function debouncedSaveMessage(
  conversationId: string,
  messageId: string,
  message: Message,
  delay: number = 1000
): void {
  const key = `${conversationId}:${messageId}`
  
  const existingTimer = debouncedSaveTimers.get(key)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }
  
  const timer = setTimeout(async () => {
    try {
      await messageStorage.updateMessage(conversationId, messageId, message)
      debouncedSaveTimers.delete(key)
    } catch (error) {
    }
  }, delay)
  
  debouncedSaveTimers.set(key, timer)
}

function flushAllDebouncedSaves(): void {
  debouncedSaveTimers.forEach((timer) => {
    clearTimeout(timer)
  })
  debouncedSaveTimers.clear()
}

export interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messagesByConversation: Record<string, Message[]>
  loading: boolean
  error: string | null
  inputValue: string
}

export interface ChatActions {
  loadConversations: () => Promise<void>
  createConversation: () => Promise<void>
  renameConversation: (conversationId: string, newTitle: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<void>
  selectConversation: (conversationId: string) => void

  addMessage: (conversationId: string, message: Omit<Message, 'conversationId'>) => Promise<void>
  replaceMessage: (conversationId: string, tempId: string, newMessage: Omit<Message, 'conversationId'> | null) => Promise<void>
  updateMessageStatus: (conversationId: string, messageId: string, status: 'sending' | 'sent' | 'failed') => void
  clearMessages: (conversationId: string) => Promise<void>
  getMessages: (conversationId: string) => Message[]
  loadMessages: (conversationId: string) => Promise<void>

  get currentMessages(): Message[]

  setInputValue: (value: string) => void
  setLoading: (loading: boolean) => void

  _handleLogout: () => void
}

export type ChatStore = ChatState & ChatActions

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      messagesByConversation: {},
      loading: false,
      error: null,
      inputValue: '',

      loadConversations: async () => {
        try {
          const conversations = await conversationStorage.loadConversations()
          set({ conversations })
        } catch (error) {
          throw error
        }
      },

      createConversation: async () => {
        const { conversations } = get()
        try {
          const newConversation = await conversationStorage.createConversation(
            `New Chat ${conversations.length + 1}`
          )
          set({
            conversations: [newConversation, ...conversations],
            activeConversationId: newConversation.id
          })
        } catch (error) {
          throw error
        }
      },

      renameConversation: async (conversationId: string, newTitle: string) => {
        try {
          const updatedConversation = await conversationStorage.updateConversation(
            conversationId,
            { title: newTitle }
          )

          if (!updatedConversation) {
            throw new Error('Conversation not found')
          }

          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId ? updatedConversation : conv
            )
          }))
        } catch (error) {
          throw error
        }
      },

      deleteConversation: async (conversationId: string) => {
        try {
          await chatOrchestration.deleteConversation(conversationId)

          set((state) => {
            const newConversations = state.conversations.filter(
              (conv) => conv.id !== conversationId
            )
            return {
              conversations: newConversations,
              activeConversationId:
                state.activeConversationId === conversationId
                  ? (newConversations.length > 0 ? newConversations[0].id : null)
                  : state.activeConversationId
            }
          })
        } catch (error) {
          throw error
        }
      },

      selectConversation: (conversationId: string) => {
        set({ activeConversationId: conversationId })
      },

      addMessage: async (
        conversationId: string,
        message: Omit<Message, 'conversationId'>
      ) => {
        const fullMessage: Message = {
          ...message,
          conversationId,
          id: message.id || generateId(),
          status: message.status || 'sent',
          isTemp: false,
        }

        try {
          await chatOrchestration.addMessage(conversationId, fullMessage)
        } catch (error) {
        }

        set((state) => ({
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: [
              ...(state.messagesByConversation[conversationId] || []),
              fullMessage
            ]
          }
        }))
      },

      replaceMessage: async (
        conversationId: string,
        tempId: string,
        newMessage: Omit<Message, 'conversationId'> | null
      ) => {
        if (newMessage === null) {
          const key = `${conversationId}:${tempId}`
          const existingTimer = debouncedSaveTimers.get(key)
          if (existingTimer) {
            clearTimeout(existingTimer)
            debouncedSaveTimers.delete(key)
          }

          try {
            await chatOrchestration.deleteMessage(conversationId, tempId)
          } catch (error) {
          }

          set((state) => ({
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: (state.messagesByConversation[conversationId] || [])
                .filter((msg) => msg.id !== tempId)
            }
          }))
        } else {
          const fullMessage: Message = {
            ...newMessage,
            conversationId,
            id: newMessage.id || generateId(),
            status: 'sent',
            isTemp: false,
          }

          const shouldSkipLocalStorage = (newMessage as any)._skipLocalStorage === true
          const isStreaming = (newMessage as any)._isStreaming === true

          if (!shouldSkipLocalStorage) {
            try {
              const key = `${conversationId}:${tempId}`
              const existingTimer = debouncedSaveTimers.get(key)
              if (existingTimer) {
                clearTimeout(existingTimer)
                debouncedSaveTimers.delete(key)
              }
              
              await messageStorage.updateMessage(conversationId, tempId, fullMessage)
            } catch (error) {
            }
          } else if (isStreaming) {
            debouncedSaveMessage(conversationId, tempId, fullMessage, 500)
          }

          set((state) => ({
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: (state.messagesByConversation[conversationId] || [])
                .map((msg) => (msg.id === tempId ? fullMessage : msg))
            }
          }))
        }
      },

      updateMessageStatus: (
        conversationId: string,
        messageId: string,
        status: 'sending' | 'sent' | 'failed'
      ) => {
        set((state) => ({
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: (state.messagesByConversation[conversationId] || [])
              .map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
          }
        }))
      },

      clearMessages: async (conversationId: string) => {
        try {
          await chatOrchestration.clearMessages(conversationId)
        } catch (error) {
        }

        set((state) => ({
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: []
          }
        }))
      },

      getMessages: (conversationId: string) => {
        return get().messagesByConversation[conversationId] || []
      },

      get currentMessages(): Message[] {
        const state = get()
        const conversationId = state.activeConversationId
        return conversationId
          ? state.messagesByConversation[conversationId] || []
          : []
      },

      loadMessages: async (conversationId: string) => {
        if (!conversationId) return

        set({ loading: true, error: null })

        try {
          const messages = await messageStorage.loadMessages(conversationId)
          set((state) => ({
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: messages
            },
            loading: false
          }))
        } catch (error) {
          set({ error: 'Failed to load messages', loading: false })
          throw error
        }
      },

      setInputValue: (value: string) => {
        set({ inputValue: value })
      },

      setLoading: (loading: boolean) => {
        set({ loading })
      },

      _handleLogout: () => {
        flushAllDebouncedSaves()
        
        set({
          conversations: [],
          activeConversationId: null,
          messagesByConversation: {},
          loading: false,
          error: null,
          inputValue: ''
        })
      }
    }),
    { name: 'ChatStore' }
  )
)

window.addEventListener('beforeunload', () => {
  flushAllDebouncedSaves()
})
