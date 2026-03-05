import { useCallback } from 'react'
import { documentIOService } from '../../domains/unified-knowledge/document/services/DocumentIOService'
import { documentOperationService } from '../../domains/unified-knowledge/services'
import { handleError } from '../../domains/shared/services/errorHandlingService'

export interface UploadDocumentResult {
  success: boolean
  documentId?: string
  error?: string
}

export interface CreateDocumentResult {
  success: boolean
  documentId?: string
  error?: string
}

export interface CreateFolderResult {
  success: boolean
  folderId?: string
  error?: string
}

export function useKnowledgeOperations() {
  const uploadDocument = useCallback(async (folderId?: string): Promise<UploadDocumentResult> => {
    try {
      const { filename, content, fileType } = await documentIOService.uploadDocument()
      const document = await documentOperationService.createDocument({
        title: filename,
        content,
        file_type: fileType as 'txt' | 'docx',
        parent_id: folderId
      })
      return {
        success: true,
        documentId: document.id
      }
    } catch (error) {
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'useKnowledgeOperations', action: 'uploadDocument' }
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload document'
      }
    }
  }, [])

  const createDocument = useCallback(async (
    fileType: 'txt' | 'docx',
    folderId?: string,
    options?: { filename?: string; content?: string }
  ): Promise<CreateDocumentResult> => {
    try {
      const document = await documentOperationService.createDocument({
        title: options?.filename,
        content: options?.content,
        file_type: fileType,
        parent_id: folderId
      })
      return {
        success: true,
        documentId: document.id
      }
    } catch (error) {
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'useKnowledgeOperations', action: 'createDocument', fileType }
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create document'
      }
    }
  }, [])

  const createFolder = useCallback(async (parentId?: string): Promise<CreateFolderResult> => {
    try {
      const folder = await documentOperationService.createFolder({
        parent_id: parentId
      })
      return {
        success: true,
        folderId: folder.id
      }
    } catch (error) {
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'useKnowledgeOperations', action: 'createFolder' }
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create folder'
      }
    }
  }, [])

  const refreshDocuments = useCallback(async (): Promise<void> => {
    try {
      await documentOperationService.listDocuments()
    } catch (error) {
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'useKnowledgeOperations', action: 'refreshDocuments' }
      })
    }
  }, [])

  return {
    uploadDocument,
    createDocument,
    createFolder,
    refreshDocuments
  }
}
