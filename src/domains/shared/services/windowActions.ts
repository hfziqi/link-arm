import { createLogger } from '../utils/logger'
import { handleError } from './errorHandlingService'
import { documentIOService } from '../../unified-knowledge/document/services/DocumentIOService'
import type { MessageAttachment } from '../../chat/types/chat.types'

const logger = createLogger('WindowActions')

export const openDocument = async (
  documentId: string,
  fileType?: string,
  parentId?: string
): Promise<void> => {
  const extension = fileType === 'docx' ? '.docx' : '.txt'
  logger.info('Opening document', { documentId, extension })

  try {
    await documentIOService.openDocument(documentId, extension, parentId)
    logger.info('Document opened')
  } catch (error) {
    logger.error('Failed to open document', error)
    handleError(error, { logToConsole: true })
    throw error
  }
}

export const handleAttachmentDoubleClick = async (attachment: MessageAttachment): Promise<void> => {
  logger.info('Processing double click event', { type: attachment.type, id: attachment.id })

  const { type, id, fileType, parentId } = attachment

  if (!id) {
    logger.warn('Attachment ID does not exist')
    return
  }

  try {
    switch (type) {
      case 'task':
        logger.info('Task feature removed in open source version')
        break

      case 'document':
        await openDocument(id, fileType, parentId)
        break

      case 'folder':
        logger.info('Folder type not supported')
        break

      case 'video':
      case 'image':
        logger.info('Video/Image type not supported')
        break

      default: {
        logger.warn('Unknown attachment type', { type })
      }
    }
  } catch (error) {
    logger.error('Failed to open', error)
    handleError(error, { logToConsole: true })
  }
}
