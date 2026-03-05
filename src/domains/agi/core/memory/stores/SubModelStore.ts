import { createLogger } from '../../../../shared/utils/logger'
import type { SubModelExecution, CallChainNode, ToolResult, ResultQuality, MessageSource, BaseStoreConfig } from '../types/memory.types'

const logger = createLogger('SubModelStore')

export class SubModelStore {
  private executions: Map<string, SubModelExecution> = new Map()
  private callChain: CallChainNode[] = []
  private config: Required<BaseStoreConfig>

  constructor(config: BaseStoreConfig = {}) {
    this.config = {
      maxItems: config.maxItems || 50,
      maxContentLength: config.maxContentLength || 10000
    }
  }

  startExecution(
    executionId: string,
    modelId: string,
    modelName: string,
    task: string,
    parentSource: MessageSource
  ): SubModelExecution {
    const execution: SubModelExecution = {
      id: executionId,
      modelId,
      modelName,
      task: this.truncateContent(task),
      status: 'running',
      toolCalls: [],
      startTime: Date.now()
    }

    this.executions.set(executionId, execution)

    this.callChain.push({
      id: executionId,
      parentId: parentSource.modelId,
      modelId,
      modelName,
      depth: parentSource.callDepth + 1,
      task: this.truncateContent(task),
      status: 'running'
    })

    this.enforceMaxItems()

    logger.info(`[SubModelStore] Started execution: ${modelName}, task: ${task.slice(0, 50)}...`)
    return execution
  }

  completeExecution(
    executionId: string,
    result: string,
    quality?: ResultQuality
  ): void {
    const execution = this.executions.get(executionId)
    if (execution) {
      execution.status = 'completed'
      execution.result = this.truncateContent(result)
      execution.endTime = Date.now()
      execution.quality = quality

      const node = this.callChain.find(n => n.id === executionId)
      if (node) {
        node.status = 'completed'
        node.result = result.slice(0, 100) + '...'
      }

      logger.info(`[SubModelStore] Completed execution: ${execution.modelName}, quality: ${quality}`)
    }
  }

  failExecution(executionId: string, error: string): void {
    const execution = this.executions.get(executionId)
    if (execution) {
      execution.status = 'failed'
      execution.result = this.truncateContent(error)
      execution.endTime = Date.now()
      execution.quality = 'poor'

      const node = this.callChain.find(n => n.id === executionId)
      if (node) {
        node.status = 'failed'
        node.result = error
      }

      logger.warn(`[SubModelStore] Failed execution: ${execution.modelName}, error: ${error}`)
    }
  }

  addToolResult(executionId: string, toolResult: ToolResult): void {
    const execution = this.executions.get(executionId)
    if (execution) {
      execution.toolCalls.push(toolResult)
    }
  }

  /**
   * Find running execution by model ID
   * Used to associate tool results with the correct sub-model execution
   */
  findRunningExecutionByModelId(modelId: string): SubModelExecution | undefined {
    // Iterate in reverse order to find the most recent execution (handle nested calls correctly)
    const executionIds = Array.from(this.executions.keys()).reverse()
    
    for (const id of executionIds) {
      const execution = this.executions.get(id)
      if (execution && execution.modelId === modelId && execution.status === 'running') {
        return execution
      }
    }
    return undefined
  }

  setQualityAssessment(
    executionId: string,
    quality: ResultQuality,
    score: number,
    reason: string,
    suggestion: 'accept' | 'retry' | 'escalate',
    assessedBy: MessageSource
  ): void {
    const execution = this.executions.get(executionId)
    if (execution) {
      execution.quality = quality
      execution.qualityAssessment = {
        quality,
        score,
        reason,
        suggestion,
        assessedBy,
        timestamp: Date.now()
      }
    }
  }

  getExecution(executionId: string): SubModelExecution | undefined {
    return this.executions.get(executionId)
  }

  getAllExecutions(): SubModelExecution[] {
    return Array.from(this.executions.values())
  }

  getRunningExecutions(): SubModelExecution[] {
    return Array.from(this.executions.values()).filter(e => e.status === 'running')
  }

  getCompletedExecutions(): SubModelExecution[] {
    return Array.from(this.executions.values()).filter(e => e.status === 'completed')
  }

  getFailedExecutions(): SubModelExecution[] {
    return Array.from(this.executions.values()).filter(e => e.status === 'failed')
  }

  getCallChain(): CallChainNode[] {
    return [...this.callChain]
  }

  getMaxDepth(): number {
    return this.callChain.reduce((max, node) => Math.max(max, node.depth), 0)
  }

  clear(): void {
    this.executions.clear()
    this.callChain = []
    logger.info('[SubModelStore] Cleared')
  }

  getStats(): {
    count: number
    running: number
    completed: number
    failed: number
    maxDepth: number
  } {
    const executions = Array.from(this.executions.values())
    const running = executions.filter(e => e.status === 'running').length
    const completed = executions.filter(e => e.status === 'completed').length
    const failed = executions.filter(e => e.status === 'failed').length

    return {
      count: executions.length,
      running,
      completed,
      failed,
      maxDepth: this.getMaxDepth()
    }
  }

  private enforceMaxItems(): void {
    if (this.executions.size > this.config.maxItems) {
      const entries = Array.from(this.executions.entries())
      const toRemove = entries.slice(0, entries.length - this.config.maxItems)
      for (const [key] of toRemove) {
        this.executions.delete(key)
      }
    }

    if (this.callChain.length > this.config.maxItems) {
      const excess = this.callChain.length - this.config.maxItems
      this.callChain = this.callChain.slice(excess)
    }
  }

  private truncateContent(content: string): string {
    if (content.length <= this.config.maxContentLength) return content
    return content.slice(0, this.config.maxContentLength) + '\n...[Truncated]'
  }
}
