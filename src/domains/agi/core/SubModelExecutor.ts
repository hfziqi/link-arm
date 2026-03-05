import { modelOrchestration } from '../../models/services/modelOrchestration'
import { getModelCardService } from '../services/ModelCardService'
import { ModelCaller } from './ModelCaller'
import { createLogger } from '../../shared/utils/logger'
import { buildExecutorPrompt } from '../../prompt/agi'
import type { AIModel } from '../../models/types/models.types'
import type { AGIMemory } from './memory/AGIMemory'
import type { MessageSource } from './memory/types/memory.types'
import type { ToolPlatform } from '../../tools-v2/core'
import type { ToolCall } from '../../tools-v2/types'

const logger = createLogger('SubModelExecutor')

export interface SubModelParams {
  model_id: string
  task: string
  context?: string
}

export interface SubModelResult {
  success: boolean
  content: string
  error?: string
  modelId: string
  modelName: string
  toolCalls: Array<{
    name: string
    result: any
  }>
}

export class SubModelExecutor {
  private memory: AGIMemory
  private parentSource: MessageSource
  private toolPlatform: ToolPlatform

  constructor(memory: AGIMemory, parentSource: MessageSource, toolPlatform: ToolPlatform) {
    this.memory = memory
    this.parentSource = parentSource
    this.toolPlatform = toolPlatform
  }

  async execute(params: SubModelParams): Promise<SubModelResult> {
    const { model_id, task, context } = params

    logger.info(`[SubModelExecutor] Executing sub-model: ${model_id}`)

    try {
      const subModel = await this.getSubModel(model_id)
      if (!subModel) {
        return {
          success: false,
          content: '',
          error: `Model ${model_id} not found`,
          modelId: model_id,
          modelName: 'Unknown',
          toolCalls: []
        }
      }

      const subModelSource: MessageSource = {
        modelId: subModel.id,
        modelName: subModel.name,
        type: 'sub',
        callDepth: this.parentSource.callDepth + 1
      }

      this.memory.recordAction(
        'submodel_start',
        subModelSource,
        'Submodel starting task execution',
        task,
        undefined
      )

      const messages: Array<{
        role: 'system' | 'user' | 'assistant' | 'tool'
        content: string
        tool_call_id?: string
        tool_calls?: Array<{
          id: string
          type: 'function'
          function: { name: string; arguments: string }
        }>
        reasoning_content?: string
      }> = [
        { role: 'system', content: await this.buildSubModelSystemPrompt(context) },
        { role: 'user', content: task }
      ]

      const tools = await this.toolPlatform.getAllTools()

      let done = false
      let finalContent = ''
      const toolCallsRecord: Array<{ name: string; result: any }> = []
      let iterationCount = 0
      const maxIterations = 15
      const toolCallHistory = new Set<string>()

      while (!done && iterationCount < maxIterations) {
        iterationCount++
        logger.info(`[SubModelExecutor] Sub-model iteration ${iterationCount}`)

        const result = await ModelCaller.call({
          model: subModel,
          messages,
          tools
        })

        if (result.toolCalls && result.toolCalls.length > 0) {
          if (iterationCount >= maxIterations) {
            logger.warn(`[SubModelExecutor] Sub-model reached max iterations ${maxIterations}, forcing end`)
            finalContent = result.content || 'Max tool call iterations reached'
            done = true
            break
          }

          const validToolCalls: Array<{
            id: string
            type: 'function'
            function: { name: string; arguments: string }
          }> = []

          for (const tc of result.toolCalls) {
            const callSignature = `${tc.function.name}:${tc.function.arguments.trim()}`
            
            if (toolCallHistory.has(callSignature)) {
              logger.warn(`[SubModelExecutor] Detected duplicate tool call: ${callSignature}, skipping`)
            } else {
              toolCallHistory.add(callSignature)
              validToolCalls.push({
                id: tc.id,
                type: tc.type,
                function: tc.function
              })
            }
          }

          if (validToolCalls.length === 0 && result.toolCalls.length > 0) {
             messages.push({
               role: 'assistant',
               content: result.content || '',
               reasoning_content: result.reasoningContent || '',
               tool_calls: result.toolCalls.map(tc => ({
                id: tc.id,
                type: tc.type,
                function: tc.function
              }))
             })

             for (const tc of result.toolCalls) {
               messages.push({
                 role: 'tool',
                 tool_call_id: tc.id,
                 content: JSON.stringify({ error: "Tool call failed: Detected repeated calls with identical parameters. Please change parameters or stop calling." })
               })
             }
             continue
          }
          
          const toolCallsToExecute = validToolCalls.length > 0 ? validToolCalls : result.toolCalls

          messages.push({
            role: 'assistant',
            content: '',
            reasoning_content: result.reasoningContent || '',
            tool_calls: toolCallsToExecute.map(tc => ({
              id: tc.id,
              type: tc.type,
              function: tc.function
            }))
          })

          for (const tc of toolCallsToExecute) {
            this.memory.recordAction(
              'tool_call_start',
              subModelSource,
              `Submodel calling tool: ${tc.function.name}`,
              tc.function.arguments,
              undefined
            )

            const execResult = await this.toolPlatform.executeTool(tc as ToolCall, {
              userId: 'sub-model',
              conversationId: subModelSource.modelId,
              requestId: `sub_${Date.now()}`
            })
            const toolResult = {
              success: execResult.success,
              result: execResult.result,
              error: execResult.error
            }
            toolCallsRecord.push({
              name: tc.function.name,
              result: toolResult.result
            })

            this.memory.recordAction(
              'tool_call_result',
              subModelSource,
              `Tool execution completed: ${tc.function.name}`,
              undefined,
              JSON.stringify(toolResult.result)
            )

            messages.push({
              role: 'tool' as const,
              tool_call_id: tc.id,
              content: JSON.stringify(toolResult.success ? toolResult.result : { error: toolResult.error })
            })
          }
        } else {
          finalContent = result.content
          done = true
        }
      }

      this.memory.recordAction(
        'submodel_complete',
        subModelSource,
        'Submodel task completed',
        task,
        finalContent
      )

      logger.info(`[SubModelExecutor] Submodel execution completed: ${subModel.name}`)

      return {
        success: true,
        content: finalContent,
        modelId: subModel.id,
        modelName: subModel.name,
        toolCalls: toolCallsRecord
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`[SubModelExecutor] Execution failed:`, error)

      return {
        success: false,
        content: '',
        error: errorMessage,
        modelId: model_id,
        modelName: 'Unknown',
        toolCalls: []
      }
    }
  }

  private async getSubModel(modelId: string): Promise<AIModel | null> {
    try {
      const allModels = await modelOrchestration.getAllModels()

      logger.info(`[SubModelExecutor] Looking for model: ${modelId}`)
      logger.info(`[SubModelExecutor] Available models count: ${allModels.length}`)
      logger.info(`[SubModelExecutor] Available models: ${JSON.stringify(allModels.map(m => ({ id: m.id, name: m.name })))}`)

      const userModel = allModels.find(m => {
        const matches = m.id === modelId ||
               m.id === `agent-${modelId}` ||
               m.id.replace('agent-', '') === modelId ||
               m.name.toLowerCase() === modelId.toLowerCase() ||
               m.name.toLowerCase().replace(/\s+/g, '-') === modelId.toLowerCase()
        if (matches) {
          logger.info(`[SubModelExecutor] Found match: ${m.id} (name: ${m.name})`)
        }
        return matches
      })

      if (!userModel) {
        logger.warn(`[SubModelExecutor] Model not found: ${modelId}, all models: ${JSON.stringify(allModels.map(m => m.id))}`)
        return null
      }

      const modelCardService = getModelCardService()
      const modelCard = modelCardService.generateModelCard(userModel)

      return {
        ...userModel,
        name: modelCard.name,
      }
    } catch (error) {
      logger.error(`[SubModelExecutor] Failed to get model:`, error)
      return null
    }
  }

  private async buildSubModelSystemPrompt(context?: string): Promise<string> {
    const tools = await this.toolPlatform.getAllTools()
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })

    return buildExecutorPrompt(
      tools.map(t => ({ name: t.function.name, description: t.function.description })),
      context,
      currentDate
    )
  }
}
