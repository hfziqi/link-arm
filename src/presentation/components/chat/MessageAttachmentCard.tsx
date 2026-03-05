import React from 'react'
import { Icon } from '../icons'
import { useHover } from '../../../hooks/useHover'
import { componentStyles } from '../../styles'
import type { MessageAttachment } from '../../../domains/chat/types/chat.types'
import { handleAttachmentDoubleClick as defaultHandleDoubleClick } from '../../../domains/shared/services/windowActions'
import { createLogger } from '../../../domains/shared/utils/logger'

const logger = createLogger('MessageAttachmentCard')

interface MessageAttachmentCardProps {
  attachment: MessageAttachment
  onClick?: (attachment: MessageAttachment) => void
  onDoubleClick?: (attachment: MessageAttachment) => void
}

export const MessageAttachmentCard: React.FC<MessageAttachmentCardProps> = ({
  attachment,
  onClick,
  onDoubleClick
}) => {
  const { isHovered, bind } = useHover()
  const styles = componentStyles.createMessageAttachmentCardStyles()

  const getIconName = () => {
    switch (attachment.type) {
      case 'document':
        return attachment.fileType === 'docx' ? 'document-docx' : 'document-txt'
      case 'task':
        return 'document-task'
      case 'folder':
        return 'document-folder'
      default:
        return 'document-txt'
    }
  }

  const getTypeLabel = () => {
    switch (attachment.type) {
      case 'document':
        return 'Document'
      case 'task':
        return 'Task'
      case 'video':
        return 'Video'
      case 'image':
        return 'Image'
      case 'folder':
        return 'Folder'
      default:
        return 'File'
    }
  }

  const iconName = getIconName()

  return (
    <div
      style={{
        ...styles.container,
        ...(isHovered ? styles.containerHovered : {})
      }}
      {...bind}
      onClick={() => {
        logger.debug('Click:', attachment)
        onClick?.(attachment)
      }}
      onDoubleClick={() => {
        logger.debug('Double click:', attachment)
        if (onDoubleClick) {
          onDoubleClick(attachment)
        } else {
          defaultHandleDoubleClick(attachment)
        }
      }}
    >
      <div style={styles.iconContainer}>
        <Icon name={iconName} size={32} />
      </div>


      <div style={styles.infoContainer}>
        <div style={styles.title} title={attachment.title}>
          {attachment.title}
        </div>
        <div style={styles.metaInfo}>
          <span style={styles.typeLabel}>{getTypeLabel()}</span>
          {attachment.fileType && (
            <>
              <span style={styles.separator}>•</span>
              <span style={{
                ...styles.fileTypeLabel,
                backgroundColor: attachment.fileType === 'txt' ? '#4caf50' : '#f3f4f6',
                color: attachment.fileType === 'txt' ? '#ffffff' : '#6b7280'
              }}>{attachment.fileType.toUpperCase()}</span>
            </>
          )}
        </div>
      </div>

      {isHovered && (
        <div style={styles.clickHint}>
          <Icon name="arrow-left" size={12} />
        </div>
      )}
    </div>
  )
}
