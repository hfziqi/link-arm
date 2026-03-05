// UnifiedDocumentItem - Display and interaction for unified document items

import React from 'react'
import { componentStyles } from '../../styles'
import { useHover } from '../../../hooks/useHover'
import { ContextMenu } from '../ui'
import { Icon } from '../icons'
import type { IconName } from '../icons/iconTypes'
import {
  getDocumentIconName,
  getDocumentDisplayTitle,
  buildDocumentContextMenuItems
} from '../../../domains/unified-knowledge/document/utils/documentHelpers'
import type { UnifiedDocument } from '../../../domains/unified-knowledge/types'
import { Folder } from '../../../domains/shared/types/document.types'

interface UnifiedDocumentItemProps {
  document: UnifiedDocument | Folder
  onDelete?: (id: string) => void
  onRename?: (id: string, newTitle: string) => void
  onDoubleClick?: () => void
  onOpen?: () => void
  onDownload?: () => void
}

export const UnifiedDocumentItem: React.FC<UnifiedDocumentItemProps> = ({
  document,
  onDelete,
  onRename,
  onDoubleClick,
  onOpen,
  onDownload
}) => {
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [newTitle, setNewTitle] = React.useState(document.title)
  const [showContextMenu, setShowContextMenu] = React.useState(false)
  const [contextMenuPosition, setContextMenuPosition] = React.useState({ x: 0, y: 0 })
  const { isHovered, bind } = useHover()
  const styles = componentStyles.createDocumentItemStyles()

  const handleContextMenuAction = async (action: string) => {
    switch (action) {
      case 'rename':
        setIsRenaming(true)
        break
      case 'delete':
        onDelete?.(document.id)
        break
      case 'open':
        onOpen?.()
        break
      case 'download':
        onDownload?.()
        break
    }
    setShowContextMenu(false)
  }

  const iconName = getDocumentIconName(document.fileType) as IconName
  const displayTitle = getDocumentDisplayTitle(document)
  const contextMenuItems = buildDocumentContextMenuItems(document, false, handleContextMenuAction)

  const handleRename = async () => {
    if (newTitle.trim() && newTitle !== document.title) {
      onRename?.(document.id, newTitle.trim())
    }
    setIsRenaming(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setNewTitle(document.title)
      setIsRenaming(false)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }

  return (
    <div
      style={{ ...styles.container, ...(isHovered ? styles.containerHovered : {}) }}
      {...bind}
      onDoubleClick={onDoubleClick}
    >
      <div
        style={styles.iconContainer}
        onContextMenu={handleContextMenu}
      >
        <Icon
          name={iconName}
          size={65}
        />
      </div>
      {isRenaming ? (
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyPress}
          style={styles.cardInputField}
          autoFocus
          onContextMenu={handleContextMenu}
        />
      ) : (
        <div
          style={styles.cardTitleText}
          onContextMenu={handleContextMenu}
        >
          {displayTitle}
        </div>
      )}
      {contextMenuItems.length > 0 && (
        <ContextMenu
          items={contextMenuItems}
          visible={showContextMenu}
          position={contextMenuPosition}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </div>
  )
}
