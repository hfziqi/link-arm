import { documentContentRepository } from '../repositories/DocumentContentRepository'
import { createLogger } from '../../../shared/utils/logger'

const logger = createLogger('DocumentContentStorage')

export class DocumentContentStorage {
  async saveContent(documentId: string, content: string, fileType: 'txt' | 'docx' = 'txt', folderPath?: string): Promise<void> {
    try {
      await documentContentRepository.saveContent(documentId, content, folderPath, `.${fileType}`)
    } catch (error) {
      logger.error('Failed to save document content:', error)
      throw error
    }
  }

  async getContent(documentId: string, fileType: 'txt' | 'docx' = 'txt', folderPath?: string): Promise<string | null> {
    try {
      return await documentContentRepository.loadContent(documentId, folderPath, `.${fileType}`)
    } catch (error) {
      logger.error('Failed to read document content:', error)
      return null
    }
  }

  async updateContent(documentId: string, newContent: string, fileType: 'txt' | 'docx' = 'txt', folderPath?: string): Promise<void> {
    try {
      await documentContentRepository.saveContent(documentId, newContent, folderPath, `.${fileType}`)
    } catch (error) {
      logger.error('Failed to update document content:', error)
      throw error
    }
  }

  async deleteContent(documentId: string, fileType: 'txt' | 'docx' = 'txt', folderPath?: string): Promise<void> {
    try {
      await documentContentRepository.deleteContent(documentId, folderPath, `.${fileType}`)
    } catch (error) {
      logger.error('Failed to delete document content:', error)
      throw error
    }
  }
}

let instance: DocumentContentStorage | null = null

export function getDocumentContentStorage(): DocumentContentStorage {
  if (!instance) {
    instance = new DocumentContentStorage()
  }
  return instance
}

export const documentContentStorage = getDocumentContentStorage()
