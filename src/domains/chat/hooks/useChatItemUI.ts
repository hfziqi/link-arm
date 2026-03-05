import { useState, useCallback } from 'react'

export interface ChatItemUIState {
  isRenaming: boolean
  newTitle: string
  showContextMenu: boolean
  contextMenuPosition: { x: number; y: number }
}

export interface ChatItemUICallbacks {
  startRenaming: (currentTitle: string) => void
  cancelRenaming: () => void
  updateNewTitle: (title: string) => void
  showContextMenuAt: (position: { x: number; y: number }) => void
  hideContextMenu: () => void
}

export function useChatItemUI(): ChatItemUIState & ChatItemUICallbacks {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })

  const startRenaming = useCallback((currentTitle: string) => {
    setIsRenaming(true)
    setNewTitle(currentTitle)
  }, [])

  const cancelRenaming = useCallback(() => {
    setIsRenaming(false)
  }, [])

  const updateNewTitle = useCallback((title: string) => {
    setNewTitle(title)
  }, [])

  const showContextMenuAt = useCallback((position: { x: number; y: number }) => {
    setContextMenuPosition(position)
    setShowContextMenu(true)
  }, [])

  const hideContextMenu = useCallback(() => {
    setShowContextMenu(false)
  }, [])

  return {
    isRenaming,
    newTitle,
    showContextMenu,
    contextMenuPosition,
    startRenaming,
    cancelRenaming,
    updateNewTitle,
    showContextMenuAt,
    hideContextMenu
  }
}
