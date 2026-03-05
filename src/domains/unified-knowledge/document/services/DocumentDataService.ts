import { documentIndexStorage } from './documentIndexStorage'
import { documentContentStorage } from './documentContentStorage'
import { documentFolderService } from './DocumentFolderService'
import { Document, Folder } from '../../../shared/types/document.types'
import { createLogger } from '../../../shared/utils/logger'

const logger = createLogger('DocumentDataService')
import type {
  FileType,
  FileItem,
  FileContent,
  ListFilesParams,
  CreateFileParams
} from '../../../shared/types/fileService.types'

export type { FileType, FileItem, FileContent, ListFilesParams, CreateFileParams }

export class DocumentDataService {
  async listFiles(params: ListFilesParams = {}): Promise<FileItem[]> {
    const { filter = 'all', parentId } = params
    const allItems = await documentIndexStorage.loadDocuments()
    let items = parentId !== undefined
      ? allItems.filter(item => item.parentId === parentId)
      : allItems
    if (filter !== 'all') {
      items = items.filter(item => this.matchesType(item, filter))
    }
    return items.map(this.toFileItem)
  }

  async readFile(fileId: string): Promise<FileContent> {
    const items = await documentIndexStorage.loadDocuments()
    const item = items.find(i => i.id === fileId)

    if (!item) {
      throw new Error(`File not found: ${fileId}`)
    }

    if (item.fileType === 'folder') {
      return { type: 'folder' }
    }

    if (item.fileType === 'task' || (item as any).type === 'task') {
      const folderPath = item.parentId ? await documentFolderService.buildFolderPath(item.parentId) : undefined
      const content = await documentContentStorage.getContent(fileId, 'txt', folderPath)
      const taskData = JSON.parse(content ?? '{}')
      return {
        type: 'task',
        content: content ?? undefined,
        metadata: taskData
      }
    }

    if (['txt', 'docx'].includes(item.fileType)) {
      const folderPath = item.parentId ? await documentFolderService.buildFolderPath(item.parentId) : undefined
      const content = await documentContentStorage.getContent(fileId, item.fileType as 'txt' | 'docx', folderPath)
      return {
        type: 'text',
        content: content || ''
      }
    }

    return {
      type: item.fileType as any,
      metadata: {
        fileType: item.fileType,
        title: item.title
      }
    }
  }

  async deleteFile(fileId: string, recursive?: boolean): Promise<void> {
    const items = await documentIndexStorage.loadDocuments()
    const item = items.find(i => i.id === fileId)

    if (!item) {
      throw new Error(`File not found: ${fileId}`)
    }

    if (item.fileType === 'folder' && recursive) {
      await this.deleteFolderRecursive(fileId)
    }

    await documentIndexStorage.removeDocument(fileId)

    if (item.fileType !== 'folder') {
      try {
        const folderPath = item.parentId ? await documentFolderService.buildFolderPath(item.parentId) : undefined
        await documentContentStorage.deleteContent(fileId, item.fileType as any, folderPath)
      } catch (error) {
        logger.warn(`Failed to delete file content: ${fileId}`, error)
      }
    }
  }

  async writeFile(fileId: string, content: string, fileType?: 'txt' | 'docx'): Promise<void> {
    const items = await documentIndexStorage.loadDocuments()
    const item = items.find(i => i.id === fileId)

    if (!item) {
      throw new Error(`File not found: ${fileId}`)
    }

    const type = fileType || (item.fileType as 'txt' | 'docx') || 'txt'
    const folderPath = item.parentId ? await documentFolderService.buildFolderPath(item.parentId) : undefined
    await documentContentStorage.saveContent(fileId, content, type, folderPath)
    await documentIndexStorage.touchDocument(fileId)
  }

  async createFile(params: CreateFileParams): Promise<FileItem> {
    const { title, content = '', fileType = 'txt', parentId } = params
    const documentId = `${Date.now()}_${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}`
    const now = new Date()
    const validFileType = (fileType === 'txt' || fileType === 'docx') ? fileType : 'txt'

    const folderPath = parentId ? await documentFolderService.buildFolderPath(parentId) : undefined
    await documentContentStorage.saveContent(documentId, content, validFileType, folderPath)

    const document: Document = {
      id: documentId,
      title,
      content,
      createdAt: now,
      updatedAt: now,
      fileType: validFileType,
      parentId
    }
    await documentIndexStorage.addDocument(document)

    return this.toFileItem(document)
  }

  async fileExists(fileId: string): Promise<boolean> {
    return await documentIndexStorage.documentExists(fileId)
  }

  async getFile(fileId: string): Promise<FileItem | null> {
    const items = await documentIndexStorage.loadDocuments()
    const item = items.find(i => i.id === fileId)
    return item ? this.toFileItem(item) : null
  }

  async renameFile(fileId: string, newTitle: string): Promise<FileItem> {
    const items = await documentIndexStorage.loadDocuments()
    const item = items.find(i => i.id === fileId)

    if (!item) {
      throw new Error(`File not found: ${fileId}`)
    }

    await documentIndexStorage.updateDocumentTitle(fileId, newTitle)

    return {
      ...this.toFileItem(item),
      title: newTitle,
      updatedAt: new Date()
    }
  }

  async copyFile(fileId: string, newTitle?: string, parentId?: string): Promise<FileItem> {
    const items = await documentIndexStorage.loadDocuments()
    const item = items.find(i => i.id === fileId)

    if (!item) {
      throw new Error(`File not found: ${fileId}`)
    }

    const title = newTitle || `${item.title} (copy)`
    const newId = crypto.randomUUID()
    const newItem: any = {
      ...item,
      id: newId,
      title,
      parentId: parentId ?? item.parentId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (item.fileType === 'folder') {
      await documentIndexStorage.addFolder(newItem)
    } else {
      await documentIndexStorage.addDocument(newItem)
    }

    if (item.fileType !== 'folder') {
      const oldFolderPath = item.parentId ? await documentFolderService.buildFolderPath(item.parentId) : undefined
      const newParentId = parentId ?? item.parentId
      const newFolderPath = newParentId ? await documentFolderService.buildFolderPath(newParentId) : undefined
      const content = await documentContentStorage.getContent(fileId, item.fileType as 'txt' | 'docx', oldFolderPath)
      if (content) {
        await documentContentStorage.saveContent(newId, content, item.fileType as 'txt' | 'docx', newFolderPath)
      }
    }

    if (item.fileType === 'folder') {
      await this.copyFolderChildren(fileId, newId)
    }

    return this.toFileItem(newItem)
  }

  private async copyFolderChildren(sourceFolderId: string, targetFolderId: string): Promise<void> {
    const items = await documentIndexStorage.loadDocuments()
    const children = items.filter(item => item.parentId === sourceFolderId)

    for (const child of children) {
      await this.copyFile(child.id, child.title, targetFolderId)
    }
  }

  private matchesType(item: Document | Folder, filter: FileType): boolean {
    switch (filter) {
      case 'text':
        return ['txt'].includes(item.fileType)
      case 'docx':
        return item.fileType === 'docx'
      case 'pdf':
        return false
      case 'image':
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'image'].includes(item.fileType)
      case 'video':
        return ['mp4', 'mov', 'avi', 'video'].includes(item.fileType)
      case 'task':
        return item.fileType === 'task' || (item as any).type === 'task'
      case 'folder':
        return item.fileType === 'folder'
      default:
        return true
    }
  }

  private toFileItem(item: Document | Folder): FileItem {
    return {
      id: item.id,
      title: item.title,
      fileType: item.fileType,
      type: (item as any).type,
      parentId: item.parentId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      metadata: (item as any).metadata
    }
  }

  private async deleteFolderRecursive(folderId: string): Promise<void> {
    const items = await documentIndexStorage.loadDocuments()
    const children = items.filter(item => item.parentId === folderId)

    for (const child of children) {
      if (child.fileType === 'folder') {
        await this.deleteFolderRecursive(child.id)
      }
      await documentIndexStorage.removeDocument(child.id)
      if (child.fileType !== 'folder') {
        try {
          const folderPath = child.parentId ? await documentFolderService.buildFolderPath(child.parentId) : undefined
          await documentContentStorage.deleteContent(child.id, child.fileType as any, folderPath)
        } catch (error) {
          logger.warn(`Failed to delete child file content: ${child.id}`, error)
        }
      }
    }
  }
}

let instance: DocumentDataService | null = null

export function getDocumentDataService(): DocumentDataService {
  if (!instance) {
    instance = new DocumentDataService()
  }
  return instance
}

export const documentDataService = getDocumentDataService()
