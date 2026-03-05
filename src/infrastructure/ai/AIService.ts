import { createLogger } from '../../domains/shared/utils/logger'

const logger = createLogger('AIService')

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface CompletionOptions {
  modelId?: string
  stream?: boolean
  tools?: Array<{
    type: 'function'
    function: {
      name: string
      description: string
      parameters: any
    }
  }>
  signal?: AbortSignal
}

class AIService {
  async completeWithCustomModel(
    messages: Message[],
    modelConfig: {
      baseUrl: string
      apiKey: string
      modelName: string
      endpoint?: string
      extraBody?: Record<string, any>
    },
    options: CompletionOptions = {}
  ): Promise<{ response: Response; format: 'openai' }> {
    try {
      const baseUrl = modelConfig.baseUrl.endsWith('/')
        ? modelConfig.baseUrl.slice(0, -1)
        : modelConfig.baseUrl

      const endpoint = modelConfig.endpoint || '/chat/completions'
      const url = `${baseUrl}${endpoint}`

      const requestBody: Record<string, any> = {
        model: modelConfig.modelName,
        messages: messages,
        stream: options.stream ?? true,
        ...modelConfig.extraBody
      }

      if (options.tools && options.tools.length > 0) {
        requestBody.tools = options.tools
        requestBody.tool_choice = 'auto'
      }

      logger.info(`[AIService] Calling AI API: ${modelConfig.modelName} @ ${modelConfig.baseUrl}`)
      logger.info(`[AIService] Request body keys: ${Object.keys(requestBody).join(', ')}`)
      if (requestBody.tools) {
        logger.info(`[AIService] Tools count: ${requestBody.tools.length}`)
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${modelConfig.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: options.signal
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error(`[AIService] API error response: ${errorText}`)
        throw new Error(`API request failed: ${response.status} - ${errorText}`)
      }

      const contentType = response.headers.get('content-type')
      logger.info(`[AIService] Response content-type: ${contentType}`)

      return { response, format: 'openai' }
    } catch (error) {
      logger.error('Custom model call failed:', error)
      throw error
    }
  }
}

export const aiService = new AIService()
