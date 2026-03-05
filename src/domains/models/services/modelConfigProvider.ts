import { modelOrchestration } from './modelOrchestration'

export class ModelConfigProvider {
  private isUserModel(modelId: string): boolean {
    return modelId.startsWith('user-')
  }

  async getModelConfig(): Promise<{
    id?: string
    modelName?: string
    provider?: string
    apiKey?: string
    baseUrl?: string
  }> {
    const activeModel = await modelOrchestration.getSelectedModel()

    if (!activeModel) {
      return {}
    }

    if (this.isUserModel(activeModel.id)) {
      return {
        id: activeModel.id,
        modelName: activeModel.modelName,
        provider: activeModel.provider,
        apiKey: activeModel.apiKey,
        baseUrl: activeModel.baseUrl
      }
    } else {
      return {
        id: activeModel.id,
        modelName: activeModel.modelName,
        provider: activeModel.provider
      }
    }
  }
}

export const modelConfigProvider = new ModelConfigProvider()
