import React, { useState } from 'react'
import { componentStyles } from '../../styles'
import { useHover } from '../../../hooks/useHover'
import { ContextMenu } from '../ui'

interface ModelItemProps {
  id: string
  displayName: string
  logo: string
  selected: boolean
  onSelect: (id: string) => void
  onDelete?: (id: string) => void
  showDeleteAction: boolean
  model?: any
}

export const ModelItem: React.FC<ModelItemProps> = ({
  id,
  displayName,
  logo,
  selected = false,
  onSelect,
  onDelete,
  showDeleteAction,
  model: _model
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })

  const styles = componentStyles.createModelItemStyles()
  const documentStyles = componentStyles.createDocumentItemStyles()
  const { isHovered, bind } = useHover()

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }

  return (
    <div
      data-model-item
      style={{
        ...styles.wrapper,
        ...(isHovered ? styles.wrapperHovered : {})
      }}
      {...bind}
      onContextMenu={showDeleteAction ? handleContextMenu : undefined}
    >
      <div
        style={{
          ...styles.container,
          ...styles.containerRelative
        }}
        onClick={() => onSelect?.(id)}
      >
        <div style={styles.content}>
          <img
            src={logo}
            alt={displayName}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        {selected && (
          <div style={documentStyles.selectedIndicator} />
        )}
      </div>
      <div style={styles.nameBelowCard}>
        {displayName}
      </div>
      {showDeleteAction && (
        <ContextMenu
          items={[
            {
              id: 'delete',
              label: 'Delete',
              onClick: () => {
                onDelete?.(id)
                setShowContextMenu(false)
              },
              danger: true
            }
          ]}
          visible={showContextMenu}
          position={contextMenuPosition}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </div>
  )
}
