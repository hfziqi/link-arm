import {
  IResource,
  IResourceProvider,
  ResourceType
} from '../../../shared/types/resource.types'
import { documentIndexStorage } from '../services/documentIndexStorage'
import { documentFolderService } from '../services/DocumentFolderService'
import { createLogger } from '../../../shared/utils/logger'

const logger = createLogger('FolderProvider')

export class FolderProvider implements IResourceProvider {
  readonly resourceType = ResourceType.FOLDER

  async listResources(parentId?: string): Promise<IResource[]> {
    const allItems = await documentIndexStorage.loadDocuments()

    const folders = allItems.filter(item =>
      item.fileType === 'folder' &&
      (parentId === undefined || item.parentId === parentId)
    )

    return folders.map(item => ({
      id: item.id,
      name: item.title,
      type: ResourceType.FOLDER,
      parentId: item.parentId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      metadata: {
        itemCount: allItems.filter(i => i.parentId === item.id).length
      }
    }))
  }

  async getResource(id: string): Promise<IResource | null> {
    const items = await documentIndexStorage.loadDocuments()
    const item = items.find(i => i.id === id && i.fileType === 'folder')

    if (!item) return null

    return {
      id: item.id,
      name: item.title,
      type: ResourceType.FOLDER,
      parentId: item.parentId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      metadata: {
        itemCount: items.filter(i => i.parentId === id).length
      }
    }
  }

  async deleteResource(id: string): Promise<boolean> {
    try {
      await documentFolderService.deleteFolder(id)
      return true
    } catch (error) {
      logger.error('Failed to delete folder:', error)
      return false
    }
  }

  async renameResource(id: string, newName: string): Promise<boolean> {
    try {
      await documentFolderService.renameFolder(id, newName)
      return true
    } catch (error) {
      logger.error('Failed to rename folder:', error)
      return false
    }
  }
}
