import { aiOrchestrationService } from '../../../application/services/input/AIOrchestrationService'
import { createLogger } from '../../shared/utils/logger'
import type { AIModel } from '../../models/types/models.types'
import type { ToolCall } from '../../shared/types/tool.types'

const logger = createLogger('ModelCaller')

export interface ModelCallResult {
  content: string
  reasoningContent?: string
  toolCalls?: ToolCall[]
}

export interface ModelCallOptions {
  model: AIModel
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool'
    content: string
    tool_call_id?: string
    reasoning_content?: string
    tool_calls?: Array<{
      id: string
      type: 'function'
      function: { name: string; arguments: string }
    }>
  }>
  tools?: any[]
  signal?: AbortSignal
  onContent?: (content: string) => void
  onReasoning?: (reasoning: string) => void
}

export class ModelCaller {
  static async call(options: ModelCallOptions): Promise<ModelCallResult> {
    const { model, messages, tools, signal, onContent, onReasoning } = options

    logger.info(`[ModelCaller] Calling model: ${model.name}`)

    const response = await aiOrchestrationService.route(
      messages,
      {
        id: model.id,
        baseUrl: model.baseUrl,
        apiKey: model.apiKey,
        modelName: model.modelName || model.name,
        provider: model.provider
      },
      { tools, signal }
    )

    if (!response.body) {
      throw new Error('Response body is empty')
    }

    return this.parseStreamResponse(response.body, onContent, onReasoning)
  }

  static async callStream(
    options: ModelCallOptions,
    controller: ReadableStreamDefaultController<Uint8Array>,
    encoder: TextEncoder
  ): Promise<ModelCallResult> {
    const { model, messages, tools, signal, onContent, onReasoning } = options

    logger.info(`[ModelCaller] Calling model (stream): ${model.name}`)

    const response = await aiOrchestrationService.route(
      messages,
      {
        id: model.id,
        baseUrl: model.baseUrl,
        apiKey: model.apiKey,
        modelName: model.modelName || model.name,
        provider: model.provider
      },
      { tools, signal }
    )

    if (!response.body) {
      throw new Error('Response body is empty')
    }

    return this.parseAndForwardStream(response.body, controller, encoder, onContent, onReasoning)
  }

  private static async parseStreamResponse(
    body: ReadableStream<Uint8Array>,
    onContent?: (content: string) => void,
    onReasoning?: (reasoning: string) => void
  ): Promise<ModelCallResult> {
    const reader = body.getReader()
    const decoder = new TextDecoder()

    let content = ''
    let reasoningContent = ''
    const toolCallsMap = new Map<number, ToolCall>()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue

        const data = line.slice(6).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta

          if (delta?.content) {
            content += delta.content
            onContent?.(content)
          }

          if (delta?.reasoning_content) {
            reasoningContent += delta.reasoning_content
            onReasoning?.(reasoningContent)
          }

          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const index = tc.index ?? 0
              const existing = toolCallsMap.get(index) || {
                id: '',
                type: 'function' as const,
                function: { name: '', arguments: '' }
              }

              if (tc.id) existing.id = tc.id
              if (tc.function?.name) existing.function.name = tc.function.name
              if (tc.function?.arguments) existing.function.arguments += tc.function.arguments

              toolCallsMap.set(index, existing)
            }
          }
        } catch {
        }
      }
    }

    const toolCalls = toolCallsMap.size > 0 ? Array.from(toolCallsMap.values()) : undefined

    logger.info(`[ModelCaller] Parse completed: content=${content.length} chars, toolCalls=${toolCalls?.length || 0}`)
    if (toolCalls && toolCalls.length > 0) {
      logger.info(`[ModelCaller] Tool calls detected: ${toolCalls.map(tc => tc.function.name).join(', ')}`)
    }

    return { content, reasoningContent, toolCalls }
  }

  private static async parseAndForwardStream(
    body: ReadableStream<Uint8Array>,
    controller: ReadableStreamDefaultController<Uint8Array>,
    _encoder: TextEncoder,
    onContent?: (content: string) => void,
    onReasoning?: (reasoning: string) => void
  ): Promise<ModelCallResult> {
    const reader = body.getReader()
    const decoder = new TextDecoder()

    let content = ''
    let reasoningContent = ''
    const toolCallsMap = new Map<number, ToolCall>()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      controller.enqueue(value)

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue

        const data = line.slice(6).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta

          if (delta?.content) {
            content += delta.content
            onContent?.(content)
          }

          if (delta?.reasoning_content) {
            reasoningContent += delta.reasoning_content
            onReasoning?.(reasoningContent)
          }

          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const index = tc.index ?? 0
              const existing = toolCallsMap.get(index) || {
                id: '',
                type: 'function' as const,
                function: { name: '', arguments: '' }
              }

              if (tc.id) existing.id = tc.id
              if (tc.function?.name) existing.function.name = tc.function.name
              if (tc.function?.arguments) existing.function.arguments += tc.function.arguments

              toolCallsMap.set(index, existing)
            }
          }
        } catch {
        }
      }
    }

    const toolCalls = toolCallsMap.size > 0 ? Array.from(toolCallsMap.values()) : undefined

    logger.info(`[ModelCaller] Parse and forward completed: content=${content.length} chars, toolCalls=${toolCalls?.length || 0}`)

    return { content, reasoningContent, toolCalls }
  }

  static getTools(): any[] {
    return []
  }
}
