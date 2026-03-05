import type { Document, Folder } from './document.types'
import type { FileItem, FileContent, ListFilesParams, CreateFileParams } from './fileService.types'
import type { IResource, ResourceType, ListResourcesParams } from './resource.types'

export type { ResourceType }

export interface IFileService {
  listFiles(params?: ListFilesParams): Promise<FileItem[]>
  readFile(fileId: string): Promise<FileContent>
  deleteFile(fileId: string, recursive?: boolean): Promise<void>
  renameFile(fileId: string, newTitle: string): Promise<FileItem>
  copyFile(fileId: string, newTitle?: string, parentId?: string): Promise<FileItem>
  writeFile(fileId: string, content: string, fileType?: 'txt' | 'docx'): Promise<void>
  createFile(params: CreateFileParams): Promise<FileItem>
}

export interface IKnowledgeOrchestration {
  createDocument(title: string, content: string, fileType?: 'txt' | 'docx', parentId?: string): Promise<Document>
  createFolder(title: string, parentId?: string): Promise<Folder>
  getOrCreateFolder(title: string, parentId?: string): Promise<Folder>
}

export interface IResourceManager {
  listAllResources(options?: ListResourcesParams): Promise<IResource[]>
  deleteResource(resourceId: string, type: ResourceType): Promise<boolean>
  renameResource(resourceId: string, type: ResourceType, newName: string): Promise<boolean>
}
