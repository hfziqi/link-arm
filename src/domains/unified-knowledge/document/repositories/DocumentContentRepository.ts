import { storageProvider } from '../../../../infrastructure/storage/TauriStorageProvider'
import { StorageKeyBuilder } from '../../../../infrastructure/repository/BaseRepository'
import { handleError } from '../../../shared/services/errorHandlingService'

export class DocumentContentRepository {
  private storagePath = 'knowledge'
  private keyBuilder = new StorageKeyBuilder()

  private async getUserId(): Promise<string> {
    return this.keyBuilder.getUserId()
  }

  private async buildKey(documentId: string, folderPath?: string, fileType?: string): Promise<string> {
    const userId = await this.getUserId()
    const extension = fileType || '.txt'

    if (folderPath) {
      return `user_${userId}/${this.storagePath}/${folderPath}/doc_${documentId}${extension}`
    }
    return `user_${userId}/${this.storagePath}/doc_${documentId}${extension}`
  }

  async saveContent(documentId: string, content: string, folderPath?: string, fileType?: string): Promise<void> {
    try {
      const key = await this.buildKey(documentId, folderPath, fileType)
      await storageProvider.saveRaw(key, content)
    } catch (error) {
      handleError(error, {
        logToConsole: true
      })
      throw error
    }
  }

  async loadContent(documentId: string, folderPath?: string, fileType?: string): Promise<string | null> {
    try {
      const key = await this.buildKey(documentId, folderPath, fileType)
      return await storageProvider.loadRaw(key)
    } catch (error) {
      handleError(error, {
        logToConsole: true
      })
      return null
    }
  }

  async deleteContent(documentId: string, folderPath?: string, fileType?: string): Promise<void> {
    try {
      const key = await this.buildKey(documentId, folderPath, fileType)
      await storageProvider.deleteRaw(key)
    } catch (error) {
      handleError(error, {
        logToConsole: true
      })
      throw error
    }
  }
}

export const documentContentRepository = new DocumentContentRepository()
