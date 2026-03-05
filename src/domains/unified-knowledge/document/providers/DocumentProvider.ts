import {
  IResource,
  IResourceProvider,
  ResourceType
} from '../../../shared/types/resource.types'
import { documentIndexStorage } from '../services/documentIndexStorage'
import { documentFolderService } from '../services/DocumentFolderService'
import { createLogger } from '../../../shared/utils/logger'

const logger = createLogger('DocumentProvider')

export class DocumentProvider implements IResourceProvider {
  readonly resourceType = ResourceType.DOCUMENT

  async listResources(parentId?: string): Promise<IResource[]> {
    const allItems = await documentIndexStorage.loadDocuments()

    const documents = allItems.filter(item =>
      item.fileType !== 'folder' &&
      (parentId === undefined || item.parentId === parentId)
    )

    return documents.map(item => ({
      id: item.id,
      name: item.title,
      type: ResourceType.DOCUMENT,
      parentId: item.parentId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      metadata: {
        fileType: item.fileType,
        size: (item as any).metadata?.size
      }
    }))
  }

  async getResource(id: string): Promise<IResource | null> {
    const items = await documentIndexStorage.loadDocuments()
    const item = items.find(i => i.id === id && i.fileType !== 'folder')

    if (!item) return null

    return {
      id: item.id,
      name: item.title,
      type: ResourceType.DOCUMENT,
      parentId: item.parentId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      metadata: {
        fileType: item.fileType
      }
    }
  }

  async deleteResource(id: string): Promise<boolean> {
    try {
      await documentFolderService.deleteDocument(id)
      return true
    } catch (error) {
      logger.error('Failed to delete document:', error)
      return false
    }
  }

  async renameResource(id: string, newName: string): Promise<boolean> {
    try {
      await documentFolderService.renameDocument(id, newName)
      return true
    } catch (error) {
      logger.error('Failed to rename document:', error)
      return false
    }
  }
}
