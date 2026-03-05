import { createLogger } from '../../../../shared/utils/logger'
import type { ToolResult, MessageSource, BaseStoreConfig } from '../types/memory.types'

const logger = createLogger('ToolResultStore')

export class ToolResultStore {
  private toolResults: Map<string, ToolResult> = new Map()
  private config: Required<BaseStoreConfig>

  constructor(config: BaseStoreConfig = {}) {
    this.config = {
      maxItems: config.maxItems || 100,
      maxContentLength: config.maxContentLength || 5000
    }
  }

  set(
    toolCallId: string,
    toolName: string,
    result: any,
    source: MessageSource,
    success: boolean = true,
    error?: string,
    duration: number = 0
  ): ToolResult {
    const toolResult: ToolResult = {
      toolCallId,
      toolName,
      result: this.truncateContent(
        typeof result === 'string' ? result : JSON.stringify(result)
      ),
      success,
      error,
      duration,
      timestamp: Date.now(),
      executedBy: source
    }

    this.toolResults.set(toolCallId, toolResult)
    this.enforceMaxItems()

    logger.debug(`[ToolResultStore] Added tool result: ${toolName}, success: ${success}`)
    return toolResult
  }

  get(toolCallId: string): ToolResult | undefined {
    return this.toolResults.get(toolCallId)
  }

  getAll(): ToolResult[] {
    return Array.from(this.toolResults.values())
  }

  getByToolName(toolName: string): ToolResult[] {
    return Array.from(this.toolResults.values()).filter(r => r.toolName === toolName)
  }

  getSuccessful(): ToolResult[] {
    return Array.from(this.toolResults.values()).filter(r => r.success)
  }

  getFailed(): ToolResult[] {
    return Array.from(this.toolResults.values()).filter(r => !r.success)
  }

  clear(): void {
    this.toolResults.clear()
    logger.info('[ToolResultStore] Cleared')
  }

  getStats(): { count: number; successful: number; failed: number } {
    const results = Array.from(this.toolResults.values())
    const successful = results.filter(r => r.success).length
    return {
      count: results.length,
      successful,
      failed: results.length - successful
    }
  }

  private enforceMaxItems(): void {
    if (this.toolResults.size > this.config.maxItems) {
      const entries = Array.from(this.toolResults.entries())
      const toRemove = entries.slice(0, entries.length - this.config.maxItems)
      for (const [key] of toRemove) {
        this.toolResults.delete(key)
      }
    }
  }

  private truncateContent(content: string): string {
    if (content.length <= this.config.maxContentLength) return content
    return content.slice(0, this.config.maxContentLength) + '\n...[Truncated]'
  }
}
