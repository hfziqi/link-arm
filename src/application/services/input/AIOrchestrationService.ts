import { aiService, type Message } from '../../../infrastructure/ai'
import { ModelProvider, PROVIDER_CONFIG } from '../../../domains/models/types/addModel'
import { createLogger } from '../../../domains/shared/utils/logger'

const logger = createLogger('AIOrchestrationService')

interface SendToCustomModelParams {
  messages: Message[]
  modelConfig: {
    baseUrl: string
    apiKey: string
    modelName: string
    endpoint?: string
    extraBody?: Record<string, any>
  }
  tools?: any[]
  signal?: AbortSignal
  stream?: boolean
}

export class AIOrchestrationService {
  async sendToCustomModel(
    params: SendToCustomModelParams
  ): Promise<{ response: Response; format: 'openai' }> {
    const { messages, modelConfig, tools, signal, stream } = params
    return await aiService.completeWithCustomModel(messages, modelConfig, { tools, signal, stream })
  }

  async route(
    messages: any[],
    modelConfig: { id?: string; baseUrl?: string; apiKey?: string; modelName?: string; provider?: string },
    options?: { tools?: any[]; signal?: AbortSignal; stream?: boolean }
  ): Promise<Response> {
    if (!this.isValidCustomModel(modelConfig)) {
      throw new Error(
        'Open source version only supports custom models. Please ensure the model has baseUrl, apiKey, and modelName configured.'
      )
    }

    let endpoint: string | undefined
    let extraBody: Record<string, any> | undefined

    if (modelConfig.provider) {
      const normalizedProvider = modelConfig.provider.toLowerCase()
      const providerKey = Object.keys(PROVIDER_CONFIG).find(
        key => key.toLowerCase() === normalizedProvider
      ) as ModelProvider | undefined

      if (providerKey) {
        const providerConfig = PROVIDER_CONFIG[providerKey]
        endpoint = providerConfig.endpoint
        extraBody = providerConfig.extraBody
      }
    }

    logger.info(`Using custom model path: ${modelConfig.modelName} @ ${modelConfig.baseUrl}`)

    const result = await this.sendToCustomModel({
      messages,
      modelConfig: {
        ...modelConfig as Required<Pick<typeof modelConfig, 'baseUrl' | 'apiKey' | 'modelName'>>,
        endpoint,
        extraBody
      },
      tools: options?.tools,
      signal: options?.signal,
      stream: options?.stream ?? true
    })
    return result.response
  }

  private isValidCustomModel(modelConfig: { baseUrl?: string; apiKey?: string; modelName?: string }): boolean {
    return !!(modelConfig.baseUrl && modelConfig.apiKey && modelConfig.modelName)
  }
}

let instance: AIOrchestrationService | null = null

export function getAIOrchestrationService(): AIOrchestrationService {
  if (!instance) {
    instance = new AIOrchestrationService()
  }
  return instance
}

export const aiOrchestrationService = getAIOrchestrationService()
