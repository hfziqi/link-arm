import { createLogger } from '../../shared/utils/logger'
import type {
  ToolPlugin,
  ToolDefinition,
  ToolHandler,
  ToolExecutionResult,
  ToolExecutionContext,
  ToolCategory
} from '../types'

const logger = createLogger('BaseToolPlugin')

interface ToolItem {
  definition: ToolDefinition
  handler: ToolHandler<any>
  category: ToolCategory
}

export abstract class BaseToolPlugin implements ToolPlugin {
  abstract readonly name: string
  abstract readonly description: string

  protected tools: Map<string, ToolItem> = new Map()
  protected initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info(`[${this.name}] Plugin already initialized, skipping`)
      return
    }

    logger.info(`[${this.name}] Starting initialization...`)
    await this.onInitialize()
    this.initialized = true
    logger.info(`[${this.name}] Initialization complete (${this.tools.size} tools)`)
  }

  protected abstract onInitialize(): Promise<void>

  protected async onRefresh?(): Promise<void> {
    logger.info(`[${this.name}] Refresh method not implemented`)
  }

  async refresh(): Promise<void> {
    if (this.onRefresh) {
      await this.onRefresh()
      this.initialized = true
      logger.info(`[${this.name}] Tools refreshed (${this.tools.size} tools)`)
    }
  }

  protected registerTool(
    definition: ToolDefinition,
    handler: ToolHandler<any>,
    category: ToolCategory
  ): void {
    const toolName = definition.function.name

    if (this.tools.has(toolName)) {
      logger.warn(`[${this.name}] Tool duplicate registration: ${toolName}`)
    }

    this.tools.set(toolName, { definition, handler, category })
    logger.info(`[${this.name}] Registered tool: ${toolName}`)
  }

  protected clearTools(): void {
    this.tools.clear()
    logger.info(`[${this.name}] Cleared all tool registrations`)
  }

  getTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(item => item.definition)
  }

  hasTool(toolName: string): boolean {
    return this.tools.has(toolName)
  }

  async execute(
    toolName: string,
    args: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const tool = this.tools.get(toolName)

    if (!tool) {
      return { success: false, result: null, error: `Tool not found: ${toolName}` }
    }

    logger.info(`[${this.name}] Executing tool: ${toolName}`)

    try {
      const result = await tool.handler(args, context)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`[${this.name}] Tool execution failed: ${toolName}`, error)
      return { success: false, result: null, error: errorMessage }
    }
  }
}
