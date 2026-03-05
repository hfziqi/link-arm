import { createLogger } from '../../shared/utils/logger'
import type {
  ToolPlugin,
  ToolDefinition,
  ToolCall,
  ToolExecutionResult,
  ToolExecutionContext,
  ToolPlatformConfig
} from '../types'

const logger = createLogger('ToolPlatform')

export class ToolPlatform {
  private plugins: Map<string, ToolPlugin> = new Map()
  private toolToPlugin: Map<string, string> = new Map()
  private initialized = false
  private initPromise: Promise<void> | null = null

  constructor(config: ToolPlatformConfig = {}) {
    if (config.enableLogging || config.defaultTimeout) {
      logger.info('[ToolPlatform] Config:', { enableLogging: config.enableLogging, defaultTimeout: config.defaultTimeout })
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('[ToolPlatform] Platform already initialized, skipping')
      return
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this.doInitialize()
    await this.initPromise
    this.initialized = true
  }

  private async doInitialize(): Promise<void> {
    logger.info('[ToolPlatform] Starting to initialize all plugins...')

    const initPromises: Promise<void>[] = []

    for (const [name, plugin] of this.plugins) {
      initPromises.push(
        (async () => {
          try {
            await plugin.initialize()
            const tools = plugin.getTools()
            this.registerToolMappings(name, tools)
            logger.info(`[ToolPlatform] Plugin initialized successfully: ${name} (${tools.length} tools)`)
          } catch (error) {
            logger.error(`[ToolPlatform] Plugin initialization failed: ${name}`, error)
          }
        })()
      )
    }

    await Promise.all(initPromises)
    logger.info('[ToolPlatform] All plugins initialized')
  }

  registerPlugin(plugin: ToolPlugin): void {
    if (this.plugins.has(plugin.name)) {
      logger.warn(`[ToolPlatform] Plugin already exists: ${plugin.name}, will override`)
    }

    this.plugins.set(plugin.name, plugin)
    logger.info(`[ToolPlatform] Registered plugin: ${plugin.name}`)
  }

  private registerToolMappings(pluginName: string, tools: ToolDefinition[]): void {
    for (const tool of tools) {
      const toolName = tool.function.name
      if (this.toolToPlugin.has(toolName)) {
        logger.warn(`[ToolPlatform] Tool duplicate registration: ${toolName}`)
      }
      this.toolToPlugin.set(toolName, pluginName)
    }
    logger.info(`[ToolPlatform] Tool mapping updated: ${pluginName} -> ${tools.length} tools`)
  }

  unregisterPlugin(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      logger.warn(`[ToolPlatform] Plugin does not exist: ${pluginName}`)
      return
    }

    const tools = plugin.getTools()
    for (const tool of tools) {
      this.toolToPlugin.delete(tool.function.name)
    }

    this.plugins.delete(pluginName)
    logger.info(`[ToolPlatform] Unregistered plugin: ${pluginName}`)
  }

  async getAllTools(): Promise<ToolDefinition[]> {
    if (!this.initialized) {
      await this.initialize()
    }

    const tools: ToolDefinition[] = []
    for (const plugin of this.plugins.values()) {
      try {
        const pluginTools = plugin.getTools()
        tools.push(...pluginTools)
      } catch (error) {
        logger.error(`[ToolPlatform] Failed to get plugin tools: ${plugin.name}`, error)
      }
    }

    logger.info(`[ToolPlatform] Retrieved tools list: ${tools.length} tools`)
    return tools
  }

  getAllToolsSync(): ToolDefinition[] {
    if (!this.initialized) {
      logger.warn('[ToolPlatform] Platform not initialized, please call initialize() first or use await getAllTools()')
      return []
    }

    const tools: ToolDefinition[] = []
    for (const plugin of this.plugins.values()) {
      tools.push(...plugin.getTools())
    }
    return tools
  }

  async getToolsByCategory(category: string): Promise<ToolDefinition[]> {
    const allTools = await this.getAllTools()
    return allTools.filter(tool => (tool as any).category === category)
  }

  hasTool(toolName: string): boolean {
    return this.toolToPlugin.has(toolName)
  }

  async executeTool(
    toolCall: ToolCall,
    context: Partial<ToolExecutionContext> = {}
  ): Promise<ToolExecutionResult> {
    const toolName = toolCall.function.name
    const pluginName = this.toolToPlugin.get(toolName)

    if (!pluginName) {
      logger.error(`[ToolPlatform] Tool not found: ${toolName}`)
      return {
        success: false,
        result: null,
        error: `Tool not found: ${toolName}`
      }
    }

    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      logger.error(`[ToolPlatform] Plugin not found: ${pluginName}`)
      return {
        success: false,
        result: null,
        error: `Plugin not found: ${pluginName}`
      }
    }

    const fullContext: ToolExecutionContext = {
      userId: context.userId || 'anonymous',
      conversationId: context.conversationId,
      messageId: context.messageId,
      requestId: context.requestId || `req_${Date.now()}`,
      timestamp: Date.now()
    }

    let args: Record<string, any>
    try {
      args = JSON.parse(toolCall.function.arguments)
    } catch {
      logger.error(`[ToolPlatform] Failed to parse arguments: ${toolCall.function.arguments}`)
      return {
        success: false,
        result: null,
        error: 'Failed to parse arguments'
      }
    }

    logger.info(`[ToolPlatform] Executing tool: ${toolName} (plugin: ${pluginName})`)

    const startTime = Date.now()
    try {
      const result = await plugin.execute(toolName, args, fullContext)
      const duration = Date.now() - startTime

      logger.info(`[ToolPlatform] Tool execution succeeded: ${toolName} (${duration}ms)`)
      return {
        ...result,
        duration
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      logger.error(`[ToolPlatform] Tool execution failed: ${toolName}`, error)
      return {
        success: false,
        result: null,
        error: errorMessage,
        duration
      }
    }
  }

  async executeTools(
    toolCalls: ToolCall[],
    context?: Partial<ToolExecutionContext>
  ): Promise<ToolExecutionResult[]> {
    return Promise.all(toolCalls.map(tc => this.executeTool(tc, context)))
  }

  async refreshExternalTools(): Promise<void> {
    const externalPlugin = this.plugins.get('external')
    if (externalPlugin && 'refresh' in externalPlugin) {
      await (externalPlugin as any).refresh()
      const tools = externalPlugin.getTools()
      this.registerToolMappings('external', tools)
      logger.info(`[ToolPlatform] External tools refreshed: ${tools.length} tools`)
    }
  }

  getStatus(): {
    initialized: boolean
    pluginCount: number
    toolCount: number
    plugins: string[]
  } {
    return {
      initialized: this.initialized,
      pluginCount: this.plugins.size,
      toolCount: this.toolToPlugin.size,
      plugins: Array.from(this.plugins.keys())
    }
  }
}

let platformInstance: ToolPlatform | null = null

export function getToolPlatform(): ToolPlatform {
  if (!platformInstance) {
    platformInstance = new ToolPlatform()
  }
  return platformInstance
}

export function resetToolPlatform(): void {
  platformInstance = null
}
