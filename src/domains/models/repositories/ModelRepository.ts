import { BaseRepository } from '../../../infrastructure/repository/BaseRepository'
import { storageProvider } from '../../../infrastructure/storage/TauriStorageProvider'
import { handleError } from '../../shared/services/errorHandlingService'
import type { AIModel } from '../types/models.types'

export class ModelRepository extends BaseRepository<AIModel> {
  protected getStoragePath(): string {
    return 'models'
  }

  protected getTableName(): string {
    return 'models.json'
  }

  async getSelectedModelId(): Promise<string | null> {
    try {
      const key = await this.buildKey('selected_model_id')
      const result = await storageProvider.loadRaw(key)
      return result
    } catch (error) {
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'ModelRepository', action: 'getSelectedModelId' }
      })
      return null
    }
  }

  async saveSelectedModelId(modelId: string): Promise<void> {
    try {
      const key = await this.buildKey('selected_model_id')
      await storageProvider.saveRaw(key, modelId)
    } catch (error) {
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'ModelRepository', action: 'saveSelectedModelId', modelId }
      })
      throw error
    }
  }

  async clearSelectedModelId(): Promise<void> {
    try {
      const key = await this.buildKey('selected_model_id')
      await storageProvider.deleteRaw(key)
    } catch (error) {
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'ModelRepository', action: 'clearSelectedModelId' }
      })
      throw error
    }
  }

  async getUserModelsCount(): Promise<number> {
    try {
      const models = await this.findAll()
      return models.length
    } catch (error) {
      handleError(error, {
        showToast: false,
        logToConsole: true,
        context: { source: 'ModelRepository', action: 'getUserModelsCount' }
      })
      return 0
    }
  }
}

export const modelRepository = new ModelRepository()
