import { useEffect } from 'react'
import { Sidebar, Toolbar } from './presentation/components/layout'
import { ChatArea } from './presentation/components/chat/ChatArea'
import { ModelManager } from './presentation/components/models'
import { UnifiedKnowledgeManager } from './presentation/components/unified-knowledge'
import { useChatFlow } from './domains/chat/hooks/useChatFlow'
import { useChatOrchestration, useAppInitialization, useAppState } from './application/hooks'
import { componentStyles } from './presentation/styles'
import { codeStyleManager } from './presentation/styles/CodeStyles'
import { createLogger } from './domains/shared/utils/logger'
import { WindowControls } from './presentation/components/window'
import { ModelsProvider } from './presentation/context/ModelsContext'
import { useNavigationStore } from './stores/navigation.store'
import { useChatStore } from './stores'

const logger = createLogger('App')

// Initialize global styles (executed once on app startup)
const initGlobalStyles = () => {
  const styles = componentStyles

  // 1. Scrollbar styles
  if (!document.head.querySelector('style[data-message-list-styles]')) {
    const globalStyles = styles.createGlobalStyles()
    const styleElement = document.createElement('style')
    styleElement.setAttribute('data-message-list-styles', 'true')
    styleElement.textContent = `
      .message-list-container {
        scrollbar-width: thin;
        scrollbar-color: transparent transparent;
      }
      .message-list-container:hover {
        scrollbar-color: ${globalStyles.scrollbar.thumb.backgroundColor} transparent;
      }
      .message-list-container::-webkit-scrollbar-thumb {
        background: transparent;
      }
      .message-list-container:hover::-webkit-scrollbar-thumb {
        background: ${globalStyles.scrollbar.thumb.backgroundColor};
      }
      .message-list-container::-webkit-scrollbar-button {
        display: none;
      }
    `
    document.head.appendChild(styleElement)
  }

  // 2. Animation styles
  if (!document.head.querySelector('style[data-global-animations]')) {
    const animationStyles = styles.createGlobalAnimationStyles()
    const style = document.createElement('style')
    style.setAttribute('data-global-animations', 'true')
    style.textContent = `
      ${animationStyles.spin.keyframes}
      ${animationStyles.pulse.keyframes}
    `
    document.head.appendChild(style)
  }

  // 3. Code styles
  if (!document.head.querySelector('style[data-code-styles]')) {
    codeStyleManager.applyToPage()
  }
}

// Execute initialization
initGlobalStyles()

function AppContent() {
  const inputValue = useChatStore(state => state.inputValue)
  const setInputValue = useChatStore(state => state.setInputValue)
  const setLoading = useChatStore(state => state.setLoading)

  useEffect(() => {
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const {
    activeConversationId,
    loadMessages,
    loadConversations,
    models,
    activeModelId,
    selectModel,
    addModel,
    deleteModel,
    refreshModels,
    isAIManagerActive,
    isKnowledgeBaseActive,
    createConversation,
    addMessage,
    replaceMessage,
    toggleAIManager,
    toggleKnowledgeBase
  } = useAppState()

  const { addUserMessage } = useChatFlow()

  const { processMessage } = useChatOrchestration()

  const {
    initializeApp,
    handleConversationChange
  } = useAppInitialization({
    loadConversations,
    refreshModels,
    loadMessages,
    activeConversationId
  })

  useEffect(() => {
    initializeApp()
  }, [initializeApp])

  useEffect(() => {
    handleConversationChange()
  }, [activeConversationId, handleConversationChange])

  const handleSendMessageWrapper = async () => {
    try {
      setLoading(true)

      const inputResult = await addUserMessage({
        inputValue,
        setInputValue,
        setLoading,
        createConversation,
        activeConversationId,
        addMessage
      })

      const { conversationId, messageContent } = inputResult

      await processMessage({
        conversationId,
        modelId: activeModelId!,
        messageContent,
        addMessage,
        replaceMessage
      })

    } catch (error) {
      const errorMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant' as const,
        content: `Sorry, AI service is temporarily unavailable. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        modelId: activeModelId ?? undefined
      }

      if (activeConversationId) {
        addMessage(activeConversationId, errorMessage)
      }

      logger.error('Failed to send message', error)
    } finally {
      setLoading(false)
    }
  }

  const { setCurrentView } = useNavigationStore()

  const handleDoubleClickChat = () => {
    if (isAIManagerActive) {
      toggleAIManager()
      setCurrentView('chat')
    } else if (isKnowledgeBaseActive) {
      toggleKnowledgeBase()
      setCurrentView('chat')
    }
  }

  const handleToggleAIManager = () => {
    toggleAIManager()
    if (!isAIManagerActive) {
      setCurrentView('models')
    } else {
      setCurrentView('chat')
    }
  }

  const handleToggleKnowledgeBase = () => {
    toggleKnowledgeBase()
    if (!isKnowledgeBaseActive) {
      setCurrentView('knowledge')
    } else {
      setCurrentView('chat')
    }
  }

  const styles = componentStyles.createAppStyles()

  return (
    <ModelsProvider models={models}>
      <div style={styles.container}>
      <WindowControls />

      <Toolbar
        isAIManagerActive={isAIManagerActive}
        isKnowledgeBaseActive={isKnowledgeBaseActive}
        onToggleAIManager={handleToggleAIManager}
        onToggleKnowledgeBase={handleToggleKnowledgeBase}
      />

      <div style={styles.mainContent}>
        <Sidebar
          onDoubleClickChat={handleDoubleClickChat}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          {isAIManagerActive ? (
            <div style={{ flex: 1 }}>
              <ModelManager
                models={models}
                activeModelId={activeModelId}
                onSelectModel={selectModel}
                onAddModel={addModel}
                onDeleteModel={deleteModel}
              />
            </div>
          ) : isKnowledgeBaseActive ? (
            <div style={{ flex: 1 }}>
              <UnifiedKnowledgeManager
                onDocumentsChanged={loadConversations}
              />
            </div>
          ) : (
            <ChatArea
              onSendMessage={handleSendMessageWrapper}
            />
          )}
        </div>
      </div>

    </div>
    </ModelsProvider>
  )
}

function App() {
  // Note: Standalone window and login features removed in open source version
  return <AppContent />
}

export default App
