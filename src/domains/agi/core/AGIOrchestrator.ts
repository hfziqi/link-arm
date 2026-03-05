import { AGIMemory } from './memory'
import { ModelCaller } from './ModelCaller'
import { SubModelExecutor } from './SubModelExecutor'
import { useAGIStore } from '../store/agi.store'
import { createLogger } from '../../shared/utils/logger'
import type { MessageSource } from './memory/types/memory.types'
import type { AGIOrchestratorConfig } from '../types/orchestrator.types'

import { ToolPlatform, AGIToolsPlugin, BusinessToolsPlugin, LocalFileSystemPlugin } from '../../tools-v2'
import { buildCEOPrompt } from '../../prompt/agi'
import type { BusinessToolsDependencies } from '../../tools-v2'

const logger = createLogger('AGIOrchestrator')

const DEFAULT_CONFIG: Partial<AGIOrchestratorConfig> = {
  maxRetries: 2,
  qualityThreshold: 60,
  enableCollaborationPanel: true
}

export class AGIOrchestrator {
  private config: AGIOrchestratorConfig
  private memory: AGIMemory
  private mainModelSource: MessageSource
  private messageId: string

  private toolPlatform: ToolPlatform
  private agiToolsPlugin: AGIToolsPlugin
  private businessToolsPlugin: BusinessToolsPlugin
  private localFileSystemPlugin: LocalFileSystemPlugin

  static async create(config: AGIOrchestratorConfig & { messageId: string }): Promise<AGIOrchestrator> {
    const instance = new AGIOrchestrator(config, true)
    await instance.initializeToolsV2()
    return instance
  }

  private constructor(config: AGIOrchestratorConfig & { messageId: string }, _isPrivate?: boolean) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.messageId = config.messageId
    this.memory = new AGIMemory({
      sessionId: this.config.sessionId || `session_${Date.now()}`
    })
    this.mainModelSource = {
      modelId: this.config.mainModel.id,
      modelName: this.config.mainModel.name,
      type: 'main',
      callDepth: 0
    }

    this.toolPlatform = new ToolPlatform()
    this.agiToolsPlugin = new AGIToolsPlugin()
    this.businessToolsPlugin = new BusinessToolsPlugin()
    this.localFileSystemPlugin = new LocalFileSystemPlugin()
  }

  private async initializeToolsV2(): Promise<void> {
    logger.info('[AGIOrchestrator] Initializing Tools V2...')

    this.agiToolsPlugin.setSubModelExecutor(
      this.handleCallModel.bind(this)
    )
    this.agiToolsPlugin.setModelListProvider(
      this.getAvailableModels.bind(this)
    )
    this.toolPlatform.registerPlugin(this.agiToolsPlugin)

    this.toolPlatform.registerPlugin(this.businessToolsPlugin)

    this.toolPlatform.registerPlugin(this.localFileSystemPlugin)

    if (this.config.businessDependencies) {
      this.businessToolsPlugin.setDependencies(this.config.businessDependencies)
      logger.info('[AGIOrchestrator] Business tools dependencies injected from config')
    }

    await this.toolPlatform.initialize()
    const toolCount = this.toolPlatform.getAllToolsSync().length
    logger.info(`[AGIOrchestrator] Tools V2 initialized, total ${toolCount} tools`)
  }

  private async getAvailableModels(): Promise<Array<{ id: string; name: string; description?: string }>> {
    try {
      const { modelOrchestration } = await import('../../models/services/modelOrchestration')
      const models = await modelOrchestration.getAllModels()
      
      const availableModels = models
        .filter(m => m.id !== this.config.mainModel.id)
        .map(m => ({
          id: m.id,
          name: m.name,
          description: `Model ID: ${m.id}, Provider: ${m.provider}`
        }))
      
      logger.info(`[AGIOrchestrator] Retrieved ${availableModels.length} available sub-models`)
      return availableModels
    } catch (error) {
      logger.error('[AGIOrchestrator] Failed to get available models:', error)
      return []
    }
  }

  injectBusinessToolsDependencies(deps: BusinessToolsDependencies): void {
    this.businessToolsPlugin.setDependencies(deps)
    logger.info('[AGIOrchestrator] Business tools dependencies injected')
  }

  getMemory(): AGIMemory {
    return this.memory
  }

  private syncMemoryToStore(): void {
    const store = useAGIStore.getState()
    const actions = this.memory.getActions()
    store.syncFromMemory(this.messageId, actions)
  }

  runStream(
    userInput: string,
    historyMessages?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): ReadableStream<Uint8Array> {
    const self = this
    const store = useAGIStore.getState()

    store.createSession(self.messageId, {
      conversationId: self.config.sessionId,
      userInput
    })

    return new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          self.memory.addUserMessage(userInput, self.mainModelSource)
          logger.info(`[AGIOrchestrator] Starting to process: ${userInput.slice(0, 50)}...`)

          self.memory.recordIntentAnalysis(
            self.mainModelSource,
            userInput,
            'Analyzing user requirements'
          )

          self.syncMemoryToStore()

          const messages: Array<{
            role: 'system' | 'user' | 'assistant' | 'tool'
            content: string
            tool_call_id?: string
            reasoning_content?: string
            tool_calls?: Array<{
              id: string
              type: 'function'
              function: { name: string; arguments: string }
            }>
          }> = [{ role: 'system', content: await self.buildMainModelSystemPrompt() }]

          if (historyMessages && historyMessages.length > 0) {
            for (const msg of historyMessages) {
              messages.push(msg)
            }
          }

          messages.push({ role: 'user', content: userInput })

          const tools = await self.toolPlatform.getAllTools()
          logger.info(`[AGIOrchestrator] Tool count: ${tools.length} (Tools V2)`)

          let done = false
          let iterationCount = 0
          const maxIterations = 50

          while (!done && iterationCount < maxIterations) {
            iterationCount++
            logger.info(`[AGIOrchestrator] Round ${iterationCount} of dialogue`)

            const thinkingActionId = self.memory.recordAction(
              'main_model_thinking',
              self.mainModelSource,
              `Main model thinking (Round ${iterationCount})`,
              undefined,
              undefined,
              { iteration: iterationCount },
              'running'
            )

            self.syncMemoryToStore()

            const result = await ModelCaller.callStream(
              {
                model: self.config.mainModel,
                messages,
                tools
              },
              controller,
              encoder
            )

            self.memory.updateActionStatus(thinkingActionId, 'completed', result.content?.slice(0, 200))

            if (result.content || result.toolCalls) {
              self.memory.addAssistantMessage(
                result.content || '',
                self.mainModelSource,
                result.toolCalls
              )
            }

            if (result.toolCalls && result.toolCalls.length > 0) {
              logger.info(`[AGIOrchestrator] Detected ${result.toolCalls.length} tool calls`)

              self.memory.recordDecision(
                self.mainModelSource,
                'Calling tools',
                result.content || '',
                `Calling ${result.toolCalls.length} tools`,
                { toolCalls: result.toolCalls.map(tc => tc.function.name) }
              )

              self.syncMemoryToStore()

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

              for (const toolCall of result.toolCalls) {
                const toolName = toolCall.function.name

                const callToolActionId = self.memory.recordAction(
                  'call_tool',
                  self.mainModelSource,
                  `Calling tool: ${toolName}`,
                  toolCall.function.arguments,
                  undefined,
                  { toolCallId: toolCall.id },
                  'running'
                )

                self.syncMemoryToStore()

                let toolResult: any

                try {
                  const executionResult = await self.toolPlatform.executeTool(toolCall, {
                    userId: 'current-user',
                    conversationId: self.config.sessionId,
                    messageId: self.messageId,
                    requestId: `req_${Date.now()}_${toolCall.id}`
                  })

                  toolResult = executionResult.success
                    ? executionResult.result
                    : { success: false, error: executionResult.error }

                  self.memory.updateActionStatus(callToolActionId, 'completed', JSON.stringify(toolResult).slice(0, 500))
                } catch (error) {
                  const errorMsg = error instanceof Error ? error.message : 'Unknown error'
                  toolResult = { success: false, error: errorMsg }

                  self.memory.updateActionStatus(callToolActionId, 'failed', errorMsg)
                }

                self.syncMemoryToStore()

                messages.push({
                  role: 'tool',
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(toolResult)
                })
              }

              self.memory.recordAction(
                'process_tool_result',
                self.mainModelSource,
                `Main model processing tool results (Round ${iterationCount})`,
                `Executed ${result.toolCalls.length} tools`,
                undefined,
                { iteration: iterationCount, toolCount: result.toolCalls.length }
              )

              self.syncMemoryToStore()

            } else {
              done = true
              logger.info(`[AGIOrchestrator] Dialogue completed`)

              self.syncMemoryToStore()
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()

          self.syncMemoryToStore()

          store.completeSession(self.messageId)

          logger.info(`[AGIOrchestrator] Processing completed, total ${iterationCount} rounds`)

        } catch (error) {
          logger.error('[AGIOrchestrator] Processing failed:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          )
          controller.close()

          store.failSession(self.messageId, errorMessage)
        }
      }
    })
  }

  private async handleCallModel(
    modelId: string,
    task: string,
    context?: string
  ): Promise<{ success: boolean; content: string; error?: string }> {
    logger.info(`[AGIOrchestrator] Executing sub-model: ${modelId}`)

    const executor = new SubModelExecutor(this.memory, this.mainModelSource, this.toolPlatform)
    const result = await executor.execute({
      model_id: modelId,
      task,
      context
    })

    this.syncMemoryToStore()

    return {
      success: result.success,
      content: result.content,
      error: result.error
    }
  }

  private async buildMainModelSystemPrompt(): Promise<string> {
    const tools = await this.toolPlatform.getAllTools()
    const availableModels = await this.getAvailableModels()
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })

    return buildCEOPrompt(
      availableModels,
      tools.map(t => ({ name: t.function.name, description: t.function.description })),
      currentDate
    )
  }
}
