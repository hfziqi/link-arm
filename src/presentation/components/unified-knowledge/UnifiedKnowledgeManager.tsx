import React, { useState } from 'react'
import { UnifiedDocumentList } from './UnifiedDocumentList'
import { useUnifiedDocuments } from '../../../domains/unified-knowledge/hooks'
import { componentStyles } from '../../styles'
import { ContextMenu, type ContextMenuItem } from '../ui'
import { handleError } from '../../../domains/shared/services/errorHandlingService'
import { useHover } from '../../../hooks/useHover'
import { useKnowledgeOperations } from '../../../application/hooks/useKnowledgeOperations'

interface UnifiedKnowledgeManagerProps {
  onDocumentsChanged?: () => void
}

export const UnifiedKnowledgeManager: React.FC<UnifiedKnowledgeManagerProps> = ({
  onDocumentsChanged
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const containerStyles = componentStyles.createModelContainerStyles()

  const { uploadDocument, createDocument: createNewDocument, createFolder: createNewFolder } = useKnowledgeOperations()

  const {
    allItems,
    loading,
    folderPath,
    goBack,
    deleteItem,
    renameItem,
    openItem,
    downloadItem
  } = useUnifiedDocuments({
    onDocumentsChanged
  })

  const { isHovered: isBackHovered, bind: backBind } = useHover()

  const currentFolderId = folderPath.length > 0 ? folderPath[folderPath.length - 1].id : undefined
  const showBackButton = folderPath.length > 0

  const handleContextMenuAction = async (action: string) => {
    switch (action) {
      case 'upload':
        {
          const result = await uploadDocument(currentFolderId || undefined)
          if (!result.success) {
            handleError(new Error(result.error), { showToast: false, logToConsole: true, context: { source: 'UnifiedKnowledgeManager', action: 'uploadDocument' } })
          }
        }
        break
      case 'new-txt':
        {
          const result = await createNewDocument('txt', currentFolderId || undefined)
          if (!result.success) {
            handleError(new Error(result.error), { showToast: false, logToConsole: true, context: { source: 'UnifiedKnowledgeManager', action: 'createDocument', type: 'txt' } })
          }
        }
        break
      case 'new-docx':
        {
          const result = await createNewDocument('docx', currentFolderId || undefined)
          if (!result.success) {
            handleError(new Error(result.error), { showToast: false, logToConsole: true, context: { source: 'UnifiedKnowledgeManager', action: 'createDocument', type: 'docx' } })
          }
        }
        break
      case 'new-folder':
        {
          const result = await createNewFolder(currentFolderId || undefined)
          if (!result.success) {
            handleError(new Error(result.error), { showToast: false, logToConsole: true, context: { source: 'UnifiedKnowledgeManager', action: 'createFolder' } })
          }
        }
        break
    }
    setShowContextMenu(false)
  }

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'new',
      label: 'New',
      children: [
        { id: 'new-txt', label: 'TXT Document', onClick: () => handleContextMenuAction('new-txt') },
        { id: 'new-docx', label: 'Word Document', onClick: () => handleContextMenuAction('new-docx') },
        { id: 'new-folder', label: 'Folder', onClick: () => handleContextMenuAction('new-folder') }
      ]
    },
    { id: 'upload', label: 'Upload File', onClick: () => handleContextMenuAction('upload') }
  ]

  if (loading) {
    return <div style={containerStyles.wrapper}><div style={containerStyles.content}></div></div>
  }

  return (
    <div
      style={{ ...containerStyles.wrapper, position: 'relative' as const }}
      onContextMenu={(e) => {
        e.preventDefault()
        setContextMenuPosition({ x: e.clientX, y: e.clientY })
        setShowContextMenu(true)
      }}
    >

      {showBackButton && (
        <div
          style={{
            position: 'absolute' as const,
            top: '0',
            right: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50px',
            height: '32px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            zIndex: 1000,
            backgroundColor: isBackHovered ? 'rgba(0, 0, 0, 0.15)' : 'transparent'
          }}
          onClick={goBack}
          {...backBind}
        >
          <span style={{ fontSize: '22px', fontWeight: 500, color: 'rgba(100,100,100,1)', marginTop: '-3px' }}>‹</span>
        </div>
      )}

      <div style={containerStyles.content}>
        <UnifiedDocumentList
          documents={allItems as any}
          onDelete={async (id: string) => {
            const item = allItems.find(d => d.id === id)
            if (item) {
              try {
                await deleteItem(id, item.fileType)
              } catch (error) {
                handleError(error, { showToast: true, logToConsole: true, context: { source: 'UnifiedKnowledgeManager', action: 'deleteItem' } })
              }
            }
          }}
          onRename={(id: string, newTitle: string) => {
            const item = allItems.find(d => d.id === id)
            if (item) {
              try {
                renameItem(id, newTitle, item.fileType)
              } catch (error) {
                handleError(error, { showToast: false, logToConsole: true, context: { source: 'UnifiedKnowledgeManager', action: 'renameItem' } })
              }
            }
          }}
          onOpen={(doc) => {
            try {
              openItem(doc)
            } catch (error) {
              handleError(error, { showToast: false, logToConsole: true, context: { source: 'UnifiedKnowledgeManager', action: 'openItem' } })
            }
          }}
          onDownload={(doc) => {
            try {
              downloadItem(doc)
            } catch (error) {
              handleError(error, { showToast: false, logToConsole: true, context: { source: 'UnifiedKnowledgeManager', action: 'downloadItem' } })
            }
          }}
        />
      </div>
      <ContextMenu
        items={contextMenuItems}
        visible={showContextMenu}
        position={contextMenuPosition}
        onClose={() => setShowContextMenu(false)}
      />
    </div>
  )
}
