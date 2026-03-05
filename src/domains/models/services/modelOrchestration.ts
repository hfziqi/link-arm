import { modelStorage } from './modelStorage'
import { AIModel } from '../types/models.types'
import { getModelLogo } from '../utils/modelHelpers'
import { generatePrefixedId } from '../../shared/utils/common'
import type { AddModelRequest } from '../../../stores/model.store'
import { handleError } from '../../shared/services/errorHandlingService'

export class ModelOrchestration {
  async getAllModels(): Promise<AIModel[]> {
    const [systemModels, userModels] = await Promise.all([
      Promise.resolve([] as AIModel[]),
      modelStorage.loadUserModels()
    ])

    return [...systemModels, ...userModels]
  }

  async addModel(modelData: AddModelRequest): Promise<AIModel> {
    try {
      const newModelId = generatePrefixedId('model')

      const newModel: AIModel = {
        id: newModelId,
        name: modelData.modelName,
        provider: modelData.provider,
        modelName: modelData.modelName,
        apiKey: modelData.apiKey,
        baseUrl: modelData.baseUrl,
        logo: getModelLogo({
          id: newModelId,
          provider: modelData.provider,
          name: modelData.modelName,
          modelName: modelData.modelName
        }),
        createdAt: new Date()
      }

      await modelStorage.saveModel(newModel)
      await modelStorage.saveSelectedModelId(newModelId)

      return newModel
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ModelOrchestration', action: 'addModel' } })
      throw error
    }
  }

  async deleteModel(modelId: string): Promise<boolean> {
    try {
      const success = await modelStorage.deleteModel(modelId)

      const activeModelId = await modelStorage.getSelectedModelId()
      if (activeModelId === modelId) {
        await modelStorage.clearSelectedModelId()
      }

      return success
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ModelOrchestration', action: 'deleteModel' } })
      throw error
    }
  }

  async selectModel(modelId: string): Promise<void> {
    try {
      await modelStorage.saveSelectedModelId(modelId)
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ModelOrchestration', action: 'selectModel' } })
      throw error
    }
  }

  async getSelectedModelId(): Promise<string | null> {
    try {
      return await modelStorage.getSelectedModelId()
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ModelOrchestration', action: 'getSelectedModelId' } })
      throw error
    }
  }

  async getSelectedModel(): Promise<AIModel | null> {
    try {
      const selectedModelId = await this.getSelectedModelId()
      if (!selectedModelId) return null
      
      const allModels = await this.getAllModels()
      return allModels.find(model => model.id === selectedModelId) || null
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ModelOrchestration', action: 'getSelectedModel' } })
      return null
    }
  }

  async clearSelectedModelId(): Promise<void> {
    try {
      await modelStorage.clearSelectedModelId()
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'ModelOrchestration', action: 'clearSelectedModelId' } })
      throw error
    }
  }

  async validateActiveModel(activeModelId: string | null, allModels: AIModel[]): Promise<string | null> {
    if (activeModelId && !allModels.find(m => m.id === activeModelId)) {
      await modelStorage.clearSelectedModelId()
      return null
    }
    return activeModelId
  }
}

let instance: ModelOrchestration | null = null

export function getModelOrchestration(): ModelOrchestration {
  if (!instance) {
    instance = new ModelOrchestration()
  }
  return instance
}

export const modelOrchestration = getModelOrchestration()
