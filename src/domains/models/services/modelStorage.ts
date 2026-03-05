import { modelRepository } from '../repositories/ModelRepository'
import { StorageKeyBuilder } from '../../../infrastructure/repository/BaseRepository'
import { AIModel } from '../types/models.types'
import { errorBuilders } from '../../shared/utils/errorHelpers'

export class ModelStorage {
  private keyBuilder = new StorageKeyBuilder()

  private async getUserId(): Promise<string> {
    return this.keyBuilder.getUserId()
  }

  async loadUserModels(): Promise<AIModel[]> {
    try {
      return await modelRepository.findAll()
    } catch (error) {
      errorBuilders.models.storageLoadFailed(error, 'loadUserModels')
      return []
    }
  }

  async loadModel(modelId: string): Promise<AIModel | null> {
    try {
      return await modelRepository.findById(modelId)
    } catch (error) {
      errorBuilders.models.storageLoadFailed(error, 'loadModel')
      return null
    }
  }

  async saveModel(model: AIModel): Promise<void> {
    try {
      const userId = await this.getUserId()
      const modelWithUserId = { ...model, userId }
      await modelRepository.save(modelWithUserId)
    } catch (error) {
      errorBuilders.models.storageLoadFailed(error, 'saveModel')
      throw error
    }
  }

  async saveModels(models: AIModel[]): Promise<void> {
    try {
      const userId = await this.getUserId()
      const modelsWithUserId = models.map(model => ({ ...model, userId }))
      await modelRepository.saveAll(modelsWithUserId)
    } catch (error) {
      errorBuilders.models.storageLoadFailed(error, 'saveModels')
      throw error
    }
  }

  async deleteModel(modelId: string): Promise<boolean> {
    try {
      await modelRepository.delete(modelId)
      return true
    } catch (error) {
      errorBuilders.models.storageLoadFailed(error, 'deleteModel')
      throw error
    }
  }

  async getUserModelsCount(): Promise<number> {
    return await modelRepository.getUserModelsCount()
  }

  async getSelectedModelId(): Promise<string | null> {
    try {
      return await modelRepository.getSelectedModelId()
    } catch (error) {
      errorBuilders.models.storageLoadFailed(error, 'getSelectedModelId')
      return null
    }
  }

  async saveSelectedModelId(modelId: string): Promise<void> {
    try {
      await modelRepository.saveSelectedModelId(modelId)
    } catch (error) {
      errorBuilders.models.storageLoadFailed(error, 'saveSelectedModelId')
      throw error
    }
  }

  async clearSelectedModelId(): Promise<void> {
    try {
      await modelRepository.clearSelectedModelId()
    } catch (error) {
      errorBuilders.models.storageLoadFailed(error, 'clearSelectedModelId')
      throw error
    }
  }
}

let instance: ModelStorage | null = null

export function getModelStorage(): ModelStorage {
  if (!instance) {
    instance = new ModelStorage()
  }
  return instance
}

export const modelStorage = getModelStorage()
