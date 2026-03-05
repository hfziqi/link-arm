import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface UIState {
  sidebarExpanded: boolean
  isAIManagerActive: boolean
  isKnowledgeBaseActive: boolean
  isLoginModalOpen: boolean
  isLoading: boolean
  error: string | null
}

export interface UIActions {
  toggleSidebar: () => void
  setSidebarExpanded: (expanded: boolean) => void
  toggleAIManager: () => void
  toggleKnowledgeBase: () => void
  setAIManagerActive: (active: boolean) => void
  setKnowledgeBaseActive: (active: boolean) => void
  setLoginModalOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  resetUI: () => void
}

export type UIStore = UIState & UIActions

const initialState: UIState = {
  sidebarExpanded: true,
  isAIManagerActive: false,
  isKnowledgeBaseActive: false,
  isLoginModalOpen: false,
  isLoading: false,
  error: null
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      ...initialState,

      toggleSidebar: () => {
        set((state) => ({ sidebarExpanded: !state.sidebarExpanded }))
      },
      
      setSidebarExpanded: (expanded: boolean) => {
        set({ sidebarExpanded: expanded })
      },

      toggleAIManager: () => {
        set((state) => ({
          isAIManagerActive: !state.isAIManagerActive,
          isKnowledgeBaseActive: false
        }))
      },
      
      toggleKnowledgeBase: () => {
        set((state) => ({
          isKnowledgeBaseActive: !state.isKnowledgeBaseActive,
          isAIManagerActive: false
        }))
      },
      
      setAIManagerActive: (active: boolean) => {
        set((state) => ({
          isAIManagerActive: active,
          isKnowledgeBaseActive: active ? false : state.isKnowledgeBaseActive
        }))
      },
      
      setKnowledgeBaseActive: (active: boolean) => {
        set((state) => ({
          isKnowledgeBaseActive: active,
          isAIManagerActive: active ? false : state.isAIManagerActive
        }))
      },

      setLoginModalOpen: (open: boolean) => {
        set({ isLoginModalOpen: open })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
      
      setError: (error: string | null) => {
        set({ error })
      },
      
      clearError: () => {
        set({ error: null })
      },

      resetUI: () => {
        set(initialState)
      }
    }),
    { name: 'UIStore' }
  )
)

export const selectSidebarExpanded = (state: UIStore) => state.sidebarExpanded
export const selectIsAIManagerActive = (state: UIStore) => state.isAIManagerActive
export const selectIsKnowledgeBaseActive = (state: UIStore) => state.isKnowledgeBaseActive
export const selectIsLoginModalOpen = (state: UIStore) => state.isLoginModalOpen
export const selectIsLoading = (state: UIStore) => state.isLoading
export const selectError = (state: UIStore) => state.error
