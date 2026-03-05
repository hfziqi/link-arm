import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type ViewType = 'chat' | 'knowledge' | 'models'

interface KnowledgeFolderState {
  isInFolder: boolean
  folderId: string | null
  folderName: string | null
}

interface NavigationState {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void

  knowledgeFolder: KnowledgeFolderState
  enterKnowledgeFolder: (id: string, name: string) => void
  exitKnowledgeFolder: () => void
  knowledgeBackCallback: (() => void) | null
  registerKnowledgeBackCallback: (callback: (() => void) | null) => void
}

export const useNavigationStore = create<NavigationState>()(
  devtools(
    (set, get) => {
      return {
        currentView: 'chat',
        knowledgeFolder: {
          isInFolder: false,
          folderId: null,
          folderName: null
        },
        knowledgeBackCallback: null,

        setCurrentView: (view) => set({ currentView: view }),

        enterKnowledgeFolder: (id, name) =>
          set({
            knowledgeFolder: {
              isInFolder: true,
              folderId: id,
              folderName: name
            }
          }),

        exitKnowledgeFolder: () => {
          const state = get()
          if (state.knowledgeBackCallback) {
            state.knowledgeBackCallback()
          }
          set({
            knowledgeFolder: {
              isInFolder: false,
              folderId: null,
              folderName: null
            }
          })
        },

        registerKnowledgeBackCallback: (callback) =>
          set({ knowledgeBackCallback: callback })
      }
    },
    { name: 'NavigationStore' }
  )
)
