import { documentFolderService } from '../document/services/DocumentFolderService'
import { sanitizeTitle } from '../../shared/utils/common'
import type { Document, Folder } from '../../shared/types/document.types'

export interface CreateDocumentParams {
  title?: string
  content?: string
  file_type?: 'txt' | 'docx'
  parent_id?: string
}

export interface CreateFolderParams {
  title?: string
  parent_id?: string
}

export interface DeleteResourceParams {
  id: string
  type: 'document' | 'folder'
}

export interface RenameResourceParams {
  id: string
  type: 'document' | 'folder'
  new_name: string
}

export interface CopyResourceParams {
  id: string
  type: 'document' | 'folder'
  new_title?: string
  target_parent_id?: string
}

export const documentOperationService = {
  async createDocument(params: CreateDocumentParams): Promise<Document> {
    const fileType = params.file_type === 'docx' ? 'docx' : 'txt'
    const title = params.title
      ? sanitizeTitle(params.title)
      : this.generateDefaultDocumentTitle(fileType)
    const content = params.content || ''

    return await documentFolderService.createDocument(
      title,
      content,
      fileType,
      params.parent_id
    )
  },

  async deleteDocument(id: string): Promise<void> {
    return await documentFolderService.deleteDocument(id)
  },

  async renameDocument(id: string, newName: string): Promise<void> {
    return await documentFolderService.renameDocument(id, sanitizeTitle(newName))
  },

  async createFolder(params: CreateFolderParams): Promise<Folder> {
    const title = params.title
      ? sanitizeTitle(params.title)
      : this.generateDefaultFolderName()

    return await documentFolderService.createFolder(title, params.parent_id)
  },

  async getOrCreateFolder(params: CreateFolderParams): Promise<Folder> {
    const title = params.title
      ? sanitizeTitle(params.title)
      : this.generateDefaultFolderName()

    return await documentFolderService.getOrCreateFolder(title, params.parent_id)
  },

  async deleteFolder(id: string): Promise<void> {
    return await documentFolderService.deleteFolder(id)
  },

  async renameFolder(id: string, newName: string): Promise<void> {
    return await documentFolderService.renameFolder(id, sanitizeTitle(newName))
  },

  async copyFolder(id: string, newTitle?: string, targetParentId?: string): Promise<Folder> {
    return await documentFolderService.copyFolder(id, newTitle ? sanitizeTitle(newTitle) : undefined, targetParentId)
  },

  async deleteResource(params: DeleteResourceParams): Promise<void> {
    switch (params.type) {
      case 'document':
        await this.deleteDocument(params.id)
        break
      case 'folder':
        await this.deleteFolder(params.id)
        break
    }
  },

  async renameResource(params: RenameResourceParams): Promise<void> {
    switch (params.type) {
      case 'document':
        await this.renameDocument(params.id, params.new_name)
        break
      case 'folder':
        await this.renameFolder(params.id, params.new_name)
        break
    }
  },

  async moveResource(params: { id: string; type: 'document' | 'folder'; target_parent_id?: string }): Promise<Document | Folder> {
    const targetParentId = params.target_parent_id

    switch (params.type) {
      case 'document':
        return await documentFolderService.moveDocument(params.id, targetParentId)
      case 'folder':
        return await documentFolderService.moveFolder(params.id, targetParentId)
    }
  },

  async listDocuments(): Promise<(Document | Folder)[]> {
    return await documentFolderService.getDocuments()
  },

  async getDocument(id: string): Promise<(Document | Folder) | null> {
    return await documentFolderService.getDocument(id)
  },

  generateDefaultDocumentTitle(fileType: 'txt' | 'docx'): string {
    const timestamp = Date.now()
    const typeName = fileType === 'docx' ? 'Word' : 'Text'
    return `New_${typeName}_Document_${timestamp}`
  },

  generateDefaultFolderName(): string {
    const timestamp = Date.now()
    return `New_Folder_${timestamp}`
  }
}
