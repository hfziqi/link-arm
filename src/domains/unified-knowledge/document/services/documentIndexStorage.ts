import { documentRepository } from '../repositories/DocumentRepository'
import { Document, Folder } from '../../../shared/types/document.types'
import { createLogger } from '../../../shared/utils/logger'

const logger = createLogger('DocumentIndexStorage')

export class DocumentIndexStorage {
  async loadDocuments(): Promise<(Document | Folder)[]> {
    try {
      const items = await documentRepository.findAll()
      return items.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }))
    } catch (error) {
      logger.error('Failed to load documents:', error)
      return []
    }
  }

  async saveDocumentsIndex(items: (Document | Folder)[]): Promise<void> {
    try {
      await documentRepository.saveAll(items)
    } catch (error) {
      logger.error('Failed to save document index:', error)
      throw error
    }
  }

  async addDocument(document: Document): Promise<void> {
    await documentRepository.addToFront(document)
  }

  async addFolder(folder: Folder): Promise<void> {
    await documentRepository.addToFront(folder)
  }

  async removeDocument(documentId: string): Promise<void> {
    await documentRepository.delete(documentId)
  }

  async removeFolder(folderId: string): Promise<void> {
    await documentRepository.delete(folderId)
  }

  async updateDocumentTitle(documentId: string, newTitle: string): Promise<void> {
    await documentRepository.update(documentId, { title: newTitle })
  }

  async updateFolderTitle(folderId: string, newTitle: string): Promise<void> {
    await documentRepository.update(folderId, { title: newTitle })
  }

  async updateDocumentParent(documentId: string, newParentId: string | undefined): Promise<void> {
    await documentRepository.update(documentId, { parentId: newParentId })
  }

  async updateFolderParent(folderId: string, newParentId: string | undefined): Promise<void> {
    await documentRepository.update(folderId, { parentId: newParentId })
  }

  async documentExists(documentId: string): Promise<boolean> {
    return await documentRepository.documentExists(documentId)
  }

  async folderExists(folderId: string): Promise<boolean> {
    return await documentRepository.folderExists(folderId)
  }

  async touchDocument(documentId: string): Promise<void> {
    await documentRepository.update(documentId, { updatedAt: new Date() })
  }
}

let instance: DocumentIndexStorage | null = null

export function getDocumentIndexStorage(): DocumentIndexStorage {
  if (!instance) {
    instance = new DocumentIndexStorage()
  }
  return instance
}

export const documentIndexStorage = getDocumentIndexStorage()
