import { documentIndexStorage } from './documentIndexStorage'
import { documentContentStorage } from './documentContentStorage'
import { Document, Folder } from '../../../shared/types/document.types'
import { FileSystemRepository, fileSystemRepository } from '../../../../infrastructure/repository/FileSystemRepository'
import { documentEventManager } from '../../../../infrastructure/events/documentEventManager'
import { generatePrefixedId, sanitizeTitle, sanitizeTitleForId } from '../../../shared/utils/common'
import { handleError } from '../../../shared/services/errorHandlingService'

export class DocumentFolderService {
  private folderCreationLocks: Map<string, Promise<Folder>> = new Map()

  constructor(
    private fsRepository: FileSystemRepository = fileSystemRepository
  ) {}

  private getFolderLockKey(title: string, parentId?: string): string {
    return `${parentId || 'root'}:${title}`
  }

  async createDocument(title: string, content: string, fileType: 'txt' | 'docx' = 'txt', parentId?: string): Promise<Document> {
    const cleanTitle = sanitizeTitle(title)
    const documentId = `${Date.now()}_${sanitizeTitleForId(cleanTitle)}`
    const now = new Date()
    const document: Document = {
      id: documentId,
      title: cleanTitle,
      content,
      createdAt: now,
      updatedAt: now,
      fileType,
      parentId
    }

    const folderPath = parentId ? await this.buildFolderPath(parentId) : undefined
    await documentContentStorage.saveContent(documentId, content, fileType, folderPath)
    await documentIndexStorage.addDocument(document)
    documentEventManager.notify()

    return document
  }

  async createFolder(title: string, parentId?: string): Promise<Folder> {
    const cleanTitle = sanitizeTitle(title)
    const folderId = `${Date.now()}_${sanitizeTitleForId(cleanTitle)}`
    const now = new Date()
    const folder: Folder = {
      id: folderId,
      title: cleanTitle,
      createdAt: now,
      updatedAt: now,
      fileType: 'folder',
      parentId
    }

    const parentPath = parentId ? await this.buildFolderPath(parentId) : undefined
    const folderPath = parentPath
      ? `knowledge/${parentPath}/${folderId}`
      : `knowledge/${folderId}`

    await this.fsRepository.createFolder(folderPath)
    await documentIndexStorage.addFolder(folder)
    documentEventManager.notify()

    return folder
  }

  async getOrCreateFolder(title: string, parentId?: string): Promise<Folder> {
    const cleanTitle = sanitizeTitle(title)
    const lockKey = this.getFolderLockKey(cleanTitle, parentId)
    
    const existingLock = this.folderCreationLocks.get(lockKey)
    if (existingLock) {
      return existingLock
    }
    
    const existingFolder = await this.findFolderByName(cleanTitle, parentId)
    if (existingFolder) {
      return existingFolder
    }
    
    const creationPromise = this.createFolder(title, parentId)
    this.folderCreationLocks.set(lockKey, creationPromise)
    
    try {
      const folder = await creationPromise
      return folder
    } finally {
      this.folderCreationLocks.delete(lockKey)
    }
  }

  private async findFolderByName(title: string, parentId?: string): Promise<Folder | null> {
    const allItems = await documentIndexStorage.loadDocuments()
    return allItems.find(
      item => item.fileType === 'folder' && 
              item.title === title && 
              item.parentId === parentId
    ) as Folder | null
  }

  async deleteDocument(documentId: string): Promise<void> {
    const exists = await documentIndexStorage.documentExists(documentId)
    if (!exists) {
      throw new Error('Document not found')
    }

    const documents = await documentIndexStorage.loadDocuments()
    const document = documents.find(doc => doc.id === documentId)
    const fileType = document?.fileType === 'folder' ? undefined : (document?.fileType === 'txt' || document?.fileType === 'docx' ? document.fileType : undefined)
    const parentId = document?.parentId

    if (fileType) {
      const folderPath = parentId ? await this.buildFolderPath(parentId) : undefined
      await documentContentStorage.deleteContent(documentId, fileType, folderPath)
    }

    await documentIndexStorage.removeDocument(documentId)
    documentEventManager.notify()
  }

  async deleteFolder(folderId: string): Promise<void> {
    const exists = await documentIndexStorage.folderExists(folderId)
    if (!exists) {
      throw new Error('Folder not found')
    }

    const documents = await documentIndexStorage.loadDocuments()
    const folder = documents.find(doc => doc.id === folderId && doc.fileType === 'folder')
    
    await this.cleanupFolderContents(folderId)

    const parentPath = folder?.parentId ? await this.buildFolderPath(folder.parentId) : undefined
    const folderPath = parentPath
      ? `knowledge/${parentPath}/${folderId}`
      : `knowledge/${folderId}`
    
    await this.fsRepository.deleteFolder(folderPath)

    await documentIndexStorage.removeFolder(folderId)
    documentEventManager.notify()
  }

  async renameDocument(documentId: string, newTitle: string): Promise<void> {
    const exists = await documentIndexStorage.documentExists(documentId)
    if (!exists) {
      throw new Error('Document not found')
    }

    const cleanTitle = sanitizeTitle(newTitle)
    await documentIndexStorage.updateDocumentTitle(documentId, cleanTitle)
    documentEventManager.notify()
  }

  async renameFolder(folderId: string, newTitle: string): Promise<void> {
    const exists = await documentIndexStorage.folderExists(folderId)
    if (!exists) {
      throw new Error('Folder not found')
    }

    const cleanTitle = sanitizeTitle(newTitle)
    await documentIndexStorage.updateFolderTitle(folderId, cleanTitle)
    documentEventManager.notify()
  }

  async copyFolder(folderId: string, newTitle?: string, targetParentId?: string): Promise<Folder> {
    const allItems = await documentIndexStorage.loadDocuments()
    const folder = allItems.find((item) => item.id === folderId)

    if (!folder) {
      throw new Error('Folder not found')
    }

    if (folder.fileType !== 'folder') {
      throw new Error('Only folders can be copied')
    }

    const rawTitle = newTitle || `${folder.title} copy`
    const cleanTitle = sanitizeTitle(rawTitle)
    const parentId = targetParentId !== undefined ? targetParentId : folder.parentId

    const newFolderId = `${Date.now()}_${sanitizeTitleForId(cleanTitle)}`
    const now = new Date()

    const newFolder: Folder = {
      id: newFolderId,
      title: cleanTitle,
      createdAt: now,
      updatedAt: now,
      fileType: 'folder',
      parentId
    }

    const parentPath = parentId ? await this.buildFolderPath(parentId) : undefined
    const folderPath = parentPath
      ? `knowledge/${parentPath}/${newFolderId}`
      : `knowledge/${newFolderId}`

    await this.fsRepository.createFolder(folderPath)
    await documentIndexStorage.addFolder(newFolder)

    const childItems = allItems.filter((item) => item.parentId === folderId)
    for (const item of childItems) {
      if (item.fileType === 'folder') {
        continue
      } else {
        if (item.fileType !== 'txt' && item.fileType !== 'docx') {
          continue
        }

        try {
          const itemFolderPath = item.parentId ? await this.buildFolderPath(item.parentId) : undefined
          const content = await documentContentStorage.getContent(item.id, item.fileType, itemFolderPath)
          if (content === null) {
            handleError(new Error(`Failed to read document ${item.id} content`), {
              showToast: false,
              logToConsole: true,
              context: { source: 'DocumentFolderService', action: 'getContent', documentId: item.id }
            })
            continue
          }
          const newDocId = generatePrefixedId('doc')
          const newDoc = {
            ...item,
            id: newDocId,
            title: sanitizeTitle(item.title),
            parentId: newFolderId,
            createdAt: now,
            updatedAt: now
          }
          await documentIndexStorage.addDocument(newDoc)
          const newFolderPath = await this.buildFolderPath(newFolderId)
          await documentContentStorage.saveContent(newDocId, content, item.fileType as 'txt' | 'docx', newFolderPath)
        } catch (error) {
          handleError(error, {
            showToast: false,
            logToConsole: true,
            context: { source: 'DocumentFolderService', action: 'copyDocument', documentId: item.id }
          })
        }
      }
    }

    documentEventManager.notify()

    return newFolder
  }

  async updateDocumentContent(documentId: string, newContent: string): Promise<void> {
    const exists = await documentIndexStorage.documentExists(documentId)
    if (!exists) {
      throw new Error('Document not found')
    }

    const documents = await documentIndexStorage.loadDocuments()
    const document = documents.find(doc => doc.id === documentId)
    const fileType = document?.fileType === 'folder' ? undefined : (document?.fileType === 'txt' || document?.fileType === 'docx' ? document.fileType : undefined)
    const parentId = document?.parentId

    if (fileType) {
      const folderPath = parentId ? await this.buildFolderPath(parentId) : undefined
      await documentContentStorage.updateContent(documentId, newContent, fileType, folderPath)
    }

    documentEventManager.notify()
  }

  async getDocuments(): Promise<(Document | Folder)[]> {
    return await documentIndexStorage.loadDocuments()
  }

  async getDocument(documentId: string): Promise<(Document | Folder) | null> {
    const documents = await documentIndexStorage.loadDocuments()
    const document = documents.find(doc => doc.id === documentId)

    if (!document) {
      return null
    }

    if (document.fileType === 'folder') {
      return document
    }

    const fileType = document.fileType === 'txt' || document.fileType === 'docx' ? document.fileType : undefined
    const parentId = document.parentId

    if (fileType) {
      const folderPath = parentId ? await this.buildFolderPath(parentId) : undefined
      const content = await documentContentStorage.getContent(documentId, fileType, folderPath)
      return {
        ...document,
        content: content || ''
      }
    }

    return document
  }

  private async cleanupFolderContents(folderId: string): Promise<void> {
    const items = await documentIndexStorage.loadDocuments()
    const children = items.filter(item => item.parentId === folderId)

    for (const child of children) {
      if (child.fileType === 'folder') {
        await this.deleteFolder(child.id)
      } else {
        await this.deleteDocument(child.id)
      }
    }
  }

  async buildFolderPath(folderId: string): Promise<string> {
    const items = await documentIndexStorage.loadDocuments()
    const path: string[] = []
    let currentId: string | undefined = folderId

    while (currentId) {
      const folder = items.find(item => item.id === currentId && item.fileType === 'folder')
      if (folder) {
        path.unshift(folder.id)
        currentId = folder.parentId
      } else {
        break
      }
    }

    return path.join('/')
  }

  async buildDocumentPath(documentId: string): Promise<string> {
    const items = await documentIndexStorage.loadDocuments()
    const document = items.find(item => item.id === documentId)
    
    if (!document) {
      return documentId
    }

    if (!document.parentId) {
      return documentId
    }

    const folderPath = await this.buildFolderPath(document.parentId)
    return folderPath ? `${folderPath}/${documentId}` : documentId
  }

  async moveDocument(documentId: string, targetParentId: string | undefined): Promise<Document> {
    const exists = await documentIndexStorage.documentExists(documentId)
    if (!exists) {
      throw new Error('Document not found')
    }

    const documents = await documentIndexStorage.loadDocuments()
    const document = documents.find(doc => doc.id === documentId)
    
    if (!document) {
      throw new Error('Document not found')
    }

    if (document.fileType === 'folder') {
      throw new Error('Cannot move folder with moveDocument, use moveFolder instead')
    }

    const oldParentId = document.parentId
    const fileType = document.fileType === 'txt' || document.fileType === 'docx' ? document.fileType : undefined

    if (fileType && oldParentId !== targetParentId) {
      const oldFolderPath = oldParentId ? await this.buildFolderPath(oldParentId) : undefined
      const newFolderPath = targetParentId ? await this.buildFolderPath(targetParentId) : undefined
      const content = await documentContentStorage.getContent(documentId, fileType, oldFolderPath)
      if (content !== null) {
        await documentContentStorage.deleteContent(documentId, fileType, oldFolderPath)
        await documentContentStorage.saveContent(documentId, content, fileType, newFolderPath)
      }
    }

    await documentIndexStorage.updateDocumentParent(documentId, targetParentId)
    documentEventManager.notify()

    const updatedDoc = await this.getDocument(documentId)
    return updatedDoc as Document
  }

  async moveFolder(folderId: string, targetParentId: string | undefined): Promise<Folder> {
    const exists = await documentIndexStorage.folderExists(folderId)
    if (!exists) {
      throw new Error('Folder not found')
    }

    if (folderId === targetParentId) {
      throw new Error('Cannot move folder into itself')
    }

    const documents = await documentIndexStorage.loadDocuments()
    const folder = documents.find(doc => doc.id === folderId && doc.fileType === 'folder')
    
    if (!folder) {
      throw new Error('Folder not found')
    }

    let currentParentId = targetParentId
    while (currentParentId) {
      if (currentParentId === folderId) {
        throw new Error('Cannot move folder into its own subfolder')
      }
      const parentFolder = documents.find(doc => doc.id === currentParentId && doc.fileType === 'folder')
      currentParentId = parentFolder?.parentId
    }

    const oldParentPath = folder.parentId ? await this.buildFolderPath(folder.parentId) : undefined
    const newParentPath = targetParentId ? await this.buildFolderPath(targetParentId) : undefined
    
    const oldFolderPath = oldParentPath
      ? `knowledge/${oldParentPath}/${folderId}`
      : `knowledge/${folderId}`
    const newFolderPath = newParentPath
      ? `knowledge/${newParentPath}/${folderId}`
      : `knowledge/${folderId}`

    if (oldFolderPath !== newFolderPath) {
      await this.fsRepository.move(oldFolderPath, newFolderPath)
    }

    await documentIndexStorage.updateFolderParent(folderId, targetParentId)
    documentEventManager.notify()

    return folder as Folder
  }
}

let instance: DocumentFolderService | null = null

export function getDocumentFolderService(): DocumentFolderService {
  if (!instance) {
    instance = new DocumentFolderService()
  }
  return instance
}

export const documentFolderService = getDocumentFolderService()
