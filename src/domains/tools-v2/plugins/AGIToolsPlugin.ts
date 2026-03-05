import { BaseToolPlugin } from '../core/BaseToolPlugin'
import { ToolCategory } from '../types'
import type { ToolDefinition, ToolExecutionResult, ToolExecutionContext } from '../types'
import { createLogger } from '../../shared/utils/logger'

const logger = createLogger('AGIToolsPlugin')

interface CallModelArgs {
  model_id: string
  task: string
  context?: string
}

export class AGIToolsPlugin extends BaseToolPlugin {
  readonly name = 'agi-tools'
  readonly description = 'AGI orchestration tools for calling sub-models'

  private modelListProvider?: () => Promise<Array<{ id: string; name: string; description?: string }>>

  private subModelExecutor?: (
    modelId: string,
    task: string,
    context?: string
  ) => Promise<{ success: boolean; content: string; error?: string }>


  constructor() {
    super()
    // Initial registration with empty model list
    this.registerTool(
      this.createCallModelToolDefinition(),
      this.handleCallModel.bind(this),
      ToolCategory.ORCHESTRATION
    )
  }
  setModelListProvider(provider: () => Promise<Array<{ id: string; name: string; description?: string }>>): void {
    this.modelListProvider = provider
    logger.info('[AGIToolsPlugin] Model list provider set')
  }

  async getAvailableModels(): Promise<Array<{ id: string; name: string; description?: string }>> {
    if (this.modelListProvider) {
      return await this.modelListProvider()
    }
    return []
  }

  setSubModelExecutor(
    executor: (
      modelId: string,
      task: string,
      context?: string
    ) => Promise<{ success: boolean; content: string; error?: string }>
  ): void {
    this.subModelExecutor = executor
    logger.info('[AGIToolsPlugin] Sub-model executor injected')
  }

  protected async onInitialize(): Promise<void> {
    // Dynamically update tool definition when initializing, injecting available model list
    await this.updateCallModelToolDefinition()
    logger.info('[AGIToolsPlugin] Plugin initialized')
  }

  /**
   * Update call_model tool definition, injecting current available models
   */
  async updateCallModelToolDefinition(): Promise<void> {
    const models = await this.getAvailableModels()
    if (models.length > 0) {
      const modelIds = models.map(m => m.id)
      const modelDescriptions = models.map(m => `- ${m.id}: ${m.name} (${m.description || ''})`).join('\n')
      
      const newDefinition = this.createCallModelToolDefinition(modelIds, modelDescriptions)
      
      this.registerTool(
        newDefinition,
        this.handleCallModel.bind(this),
        ToolCategory.ORCHESTRATION
      )
      
      logger.info(`[AGIToolsPlugin] Updated call_model definition with ${models.length} models`)
    }
  }

  /**
   * Refresh model list - call this when models are added/removed
   */
  async refreshModelList(): Promise<void> {
    await this.updateCallModelToolDefinition()
  }

  private createCallModelToolDefinition(modelIds: string[] = [], modelDescriptions: string = ''): ToolDefinition {
    const modelIdSchema = modelIds.length > 0 
      ? {
          type: 'string',
          enum: modelIds,
          description: `Model ID to call. Available models:\n${modelDescriptions}`
        }
      : {
          type: 'string',
          description: 'Model ID to call, e.g., "gpt-4o", "claude-3-opus", "code-expert"'
        }

    return {
      type: 'function',
      function: {
        name: 'call_model',
        description: `Call other AI models to execute specific tasks.

Use cases:
1. Current task requires specific domain expertise
2. Need to parallel process multiple sub-tasks
3. Need to verify or review certain results

Examples:
- "Call the code expert model to review this code"
- "Call the translation model to translate this text into English"
- "Call the data analysis model to analyze this dataset"`,
        parameters: {
          type: 'object',
          properties: {
            model_id: modelIdSchema,
            task: {
              type: 'string',
              description: 'Specific task description for the sub-model, should be clear, specific, and executable'
            },
            context: {
              type: 'string',
              description: 'Optional context information to help sub-model better understand task background'
            }
          },
          required: ['model_id', 'task']
        }
      }
    }
  }

  private async handleCallModel(
    args: CallModelArgs,
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const { model_id, task, context: taskContext } = args

    logger.info(`[AGIToolsPlugin] Calling sub-model: ${model_id}`)
    logger.info(`[AGIToolsPlugin] Task: ${task.slice(0, 100)}...`)

    if (!this.subModelExecutor) {
      logger.error('[AGIToolsPlugin] Sub-model executor not injected')
      return {
        success: false,
        result: null,
        error: 'Sub-model executor not initialized, please ensure AGIOrchestrator is properly initialized'
      }
    }

    try {
      const result = await this.subModelExecutor(model_id, task, taskContext)

      if (result.success) {
        logger.info(`[AGIToolsPlugin] Sub-model call succeeded: ${model_id}`)
        return {
          success: true,
          result: {
            model_id,
            content: result.content
          }
        }
      } else {
        logger.error(`[AGIToolsPlugin] Sub-model call failed: ${model_id} - ${result.error}`)
        return {
          success: false,
          result: null,
          error: result.error || 'Sub-model call failed'
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`[AGIToolsPlugin] Sub-model call exception: ${model_id}`, error)
      return {
        success: false,
        result: null,
        error: `Sub-model call exception: ${errorMessage}`
      }
    }
  }
}

let agiToolsPluginInstance: AGIToolsPlugin | null = null

export function getAGIToolsPlugin(): AGIToolsPlugin {
  if (!agiToolsPluginInstance) {
    agiToolsPluginInstance = new AGIToolsPlugin()
  }
  return agiToolsPluginInstance
}

export function resetAGIToolsPlugin(): void {
  agiToolsPluginInstance = null
}
