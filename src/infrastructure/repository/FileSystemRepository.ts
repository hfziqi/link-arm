import { invoke } from '@tauri-apps/api/core'
import { handleError } from '../../domains/shared/services/errorHandlingService'
import { StorageKeyBuilder } from './BaseRepository'

export interface UploadDocumentResult {
  filename: string
  content: string
  fileType: 'txt' | 'docx'
}

export class FileSystemRepository {
  private keyBuilder = new StorageKeyBuilder()

  protected async buildKey(path: string): Promise<string> {
    return this.keyBuilder.buildKey('documents', path)
  }

  protected async getUserId(): Promise<string> {
    return this.keyBuilder.getUserId()
  }

  async createFolder(folderPath: string): Promise<void> {
    try {
      const key = await this.buildKey(folderPath)
      await invoke('create_folder', { folderPath: key })
    } catch (error) {
      handleError(error, {
        logToConsole: true,
        context: { operation: 'createFolder', path: folderPath }
      })
      throw error
    }
  }

  async deleteFolder(folderPath: string): Promise<void> {
    try {
      const key = await this.buildKey(folderPath)
      await invoke('delete_folder', { folderPath: key })
    } catch (error) {
      handleError(error, {
        logToConsole: true,
        context: { operation: 'deleteFolder', path: folderPath }
      })
      throw error
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const key = await this.buildKey(filePath)
      await invoke('delete_file', { filePath: key })
    } catch (error) {
      handleError(error, {
        logToConsole: true,
        context: { operation: 'deleteFile', path: filePath }
      })
      throw error
    }
  }

  async move(oldPath: string, newPath: string): Promise<void> {
    try {
      const oldKey = await this.buildKey(oldPath)
      const newKey = await this.buildKey(newPath)
      await invoke('move_item', { oldPath: oldKey, newPath: newKey })
    } catch (error) {
      handleError(error, {
        logToConsole: true,
        context: { operation: 'move', oldPath, newPath }
      })
      throw error
    }
  }

  async copy(sourcePath: string, targetPath: string): Promise<void> {
    try {
      const sourceKey = await this.buildKey(sourcePath)
      const targetKey = await this.buildKey(targetPath)
      await invoke('copy_item', { sourcePath: sourceKey, targetPath: targetKey })
    } catch (error) {
      handleError(error, {
        logToConsole: true,
        context: { operation: 'copy', sourcePath, targetPath }
      })
      throw error
    }
  }

  async openDocumentFile(
    documentId: string,
    extension: string = '.txt',
    parentId?: string
  ): Promise<void> {
    try {
      const userId = await this.getUserId()
      await invoke('open_document_file', {
        documentId,
        userId,
        extension,
        parentId: parentId || null
      })
    } catch (error) {
      handleError(error, {
        logToConsole: true,
        context: { operation: 'openDocumentFile', documentId }
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
      await invoke('save_document_dialog', {
        documentId,
        content,
        suggestedName,
        extension
      })
    } catch (error) {
      handleError(error, {
        logToConsole: true,
        context: { operation: 'downloadDocument', documentId }
      })
      throw error
    }
  }

  async uploadDocument(): Promise<UploadDocumentResult> {
    try {
      const result = await invoke<string>('open_document_dialog')
      return JSON.parse(result)
    } catch (error) {
      handleError(error, {
        logToConsole: true,
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
      const userId = await this.getUserId()
      const result = await invoke<string>('download_folder', {
        folderId,
        folderName,
        userId,
        parentId: parentId || null
      })
      return result
    } catch (error) {
      handleError(error, {
        logToConsole: true,
        context: { operation: 'downloadFolder', folderId }
      })
      throw error
    }
  }
}

export const fileSystemRepository = new FileSystemRepository()
