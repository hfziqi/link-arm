// UnifiedDocumentList - Rendering for unified document list

import React from 'react'
import { UnifiedDocumentItem } from './UnifiedDocumentItem'
import { componentStyles } from '../../styles'
import type { UnifiedDocument } from '../../../domains/unified-knowledge/types'
import { Folder } from '../../../domains/shared/types/document.types'

interface UnifiedDocumentListProps {
  documents: (UnifiedDocument | Folder)[]
  onDelete: (id: string) => void
  onRename: (id: string, newTitle: string) => void
  onOpen: (doc: UnifiedDocument | Folder) => void
  onDownload: (doc: UnifiedDocument | Folder) => void
}

export const UnifiedDocumentList: React.FC<UnifiedDocumentListProps> = ({
  documents,
  onDelete,
  onRename,
  onOpen,
  onDownload
}) => {
  const gridStyles = componentStyles.createModelGridStyles()

  return (
    <div style={gridStyles.container}>
      {documents.map((doc) => (
        <UnifiedDocumentItem
          key={doc.id}
          document={doc}
          onDelete={onDelete}
          onRename={onRename}
          onDoubleClick={() => onOpen(doc)}
          onOpen={() => onOpen(doc)}
          onDownload={() => onDownload(doc)}
        />
      ))}
    </div>
  )
}
