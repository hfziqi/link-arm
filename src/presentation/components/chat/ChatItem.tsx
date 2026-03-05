import React from 'react';
import { componentStyles } from '../../styles';
import { useHover } from '../../../hooks/useHover';
import { ContextMenu, type ContextMenuItem } from '../ui';
import { useChatItemUI } from '../../../domains/chat/hooks/useChatItemUI';

interface ChatItemProps {
  id: string;
  title: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onDoubleClick?: () => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  id,
  title,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onDoubleClick,
}) => {
  const uiState = useChatItemUI()
  const { isHovered, bind } = useHover()
  const styles = componentStyles.createChatItemStyles()

  const handleRename = async () => {
    if (uiState.newTitle.trim() && uiState.newTitle !== title) {
      await onRename(id, uiState.newTitle.trim())
    }
    uiState.cancelRenaming()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      uiState.cancelRenaming()
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    uiState.showContextMenuAt({ x: e.clientX, y: e.clientY })
  }

  const handleContextMenuAction = async (action: 'rename' | 'delete') => {
    if (action === 'rename') {
      uiState.startRenaming(title)
    } else if (action === 'delete') {
      await onDelete(id)
    }
    uiState.hideContextMenu()
  }

  const containerStyle = {
    ...styles.mainContainer,
    ...(isActive ? styles.activeContainer : styles.inactiveContainer),
    ...(isHovered && !isActive ? styles.hoverContainer : {}),
    position: 'relative' as const
  }

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'rename',
      label: 'Rename',
      onClick: () => handleContextMenuAction('rename')
    },
    {
      id: 'delete',
      label: 'Delete',
      onClick: () => handleContextMenuAction('delete'),
      danger: true
    }
  ]

  return (
    <>
      <div
        style={containerStyle}
        onClick={() => onSelect(id)}
        onDoubleClick={onDoubleClick}
        onContextMenu={handleContextMenu}
        {...bind}
      >
        {uiState.isRenaming ? (
          <input
            type="text"
            value={uiState.newTitle}
            onChange={(e) => uiState.updateNewTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyPress}
            style={styles.inputField}
            autoFocus
          />
        ) : (
          <div style={styles.titleText}>{title}</div>
        )}
      </div>

      <ContextMenu
        items={contextMenuItems}
        visible={uiState.showContextMenu}
        position={uiState.contextMenuPosition}
        onClose={uiState.hideContextMenu}
      />
    </>
  )
}
