import { fileSystemRepository, type UploadDocumentResult } from '../../../../infrastructure/repository/FileSystemRepository'
import { handleError } from '../../../shared/services/errorHandlingService'

export class DocumentIOService {
  async openDocument(
    documentId: string,
    extension: string = '.txt',
    parentId?: string
  ): Promise<void> {
    try {
      await fileSystemRepository.openDocumentFile(documentId, extension, parentId)
    } catch (error) {
      handleError(error, {
        logToConsole: true,
        userMessage: 'Failed to open document, please try again later',
        context: { documentId, extension, parentId }
      })
      throw error
    }
  }

  async downloadDocument(
    documentId: string,
    content: string,
    suggestedName: string,
    extension: string = '.txt'
  ): Promise<void> {
    try {
      await fileSystemRepository.downloadDocument(
        documentId,
        content,
        suggestedName,
        extension
      )
    } catch (error) {
      handleError(error, {
        logToConsole: true,
        userMessage: 'Failed to download document, please try again later',
        context: { documentId, suggestedName, extension }
      })
      throw error
    }
  }

  async uploadDocument(): Promise<UploadDocumentResult> {
    try {
      return await fileSystemRepository.uploadDocument()
    } catch (error) {
      handleError(error, {
        logToConsole: true,
        userMessage: 'Failed to upload document, please try again later',
        context: { operation: 'uploadDocument' }
      })
      throw error
    }
  }

  async downloadFolder(
    folderId: string,
    folderName: string,
    parentId?: string
  ): Promise<string> {
    try {
      return await fileSystemRepository.downloadFolder(folderId, folderName, parentId)
    } catch (error) {
      handleError(error, {
        logToConsole: true,
        userMessage: 'Failed to download folder, please try again later',
        context: { folderId, folderName }
      })
      throw error
    }
  }
}

let instance: DocumentIOService | null = null

export function getDocumentIOService(): DocumentIOService {
  if (!instance) {
    instance = new DocumentIOService()
  }
  return instance
}

export const documentIOService = getDocumentIOService()
