import { Document, Folder } from '../../../shared/types/document.types'
import { ContextMenuItem, IconName } from '../../../shared/types/ui.types'

export function getDocumentIconName(fileType: string | undefined): IconName {
  switch (fileType) {
    case 'folder':
      return 'document-folder'
    case 'docx':
      return 'document-docx'
    case 'task':
      return 'document-task'
    default:
      return 'document-txt'
  }
}

export function getDocumentDisplayTitle(document: Document | Folder): string {
  if (document.fileType === 'folder') {
    return document.title
  }
  if (document.fileType === 'task') {
    return document.title
  }
  return `${document.title}.${document.fileType}`
}

export function buildDocumentContextMenuItems(
  _document: Document | Folder,
  _isActiveConversationLinked: boolean,
  onAction: (action: string) => void
): ContextMenuItem[] {
  const items: ContextMenuItem[] = [
    {
      id: 'open',
      label: 'Open',
      onClick: () => onAction('open')
    },
    {
      id: 'download',
      label: 'Download',
      onClick: () => onAction('download')
    },
    {
      id: 'rename',
      label: 'Rename',
      onClick: () => onAction('rename')
    },
    {
      id: 'delete',
      label: 'Delete',
      onClick: () => onAction('delete'),
      danger: true
    }
  ]

  return items
}
