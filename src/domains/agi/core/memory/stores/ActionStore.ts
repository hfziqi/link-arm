import { createLogger } from '../../../../shared/utils/logger'
import type { ModelAction, ModelActionType, MessageSource, BaseStoreConfig } from '../types/memory.types'

const logger = createLogger('ActionStore')

export class ActionStore {
  private actions: ModelAction[] = []
  private config: Required<BaseStoreConfig>

  constructor(config: BaseStoreConfig = {}) {
    this.config = {
      maxItems: config.maxItems || 1000,
      maxContentLength: config.maxContentLength || 10000
    }
  }

  record(
    actionType: ModelActionType,
    source: MessageSource,
    description: string,
    input?: string,
    output?: string,
    metadata?: Record<string, any>,
    status: 'running' | 'completed' | 'failed' = 'completed'
  ): string {
    const action: ModelAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      actionType,
      source,
      description,
      input: input ? this.truncateContent(input) : undefined,
      output: output ? this.truncateContent(output) : undefined,
      status,
      metadata,
      timestamp: Date.now()
    }

    this.actions.push(action)
    this.enforceMaxItems()

    logger.debug(`[ActionStore] Recorded action: ${actionType} by ${source.modelName} (${status})`)
    return action.id
  }

  updateStatus(
    actionId: string,
    status: 'running' | 'completed' | 'failed',
    output?: string
  ): void {
    const action = this.actions.find(a => a.id === actionId)
    if (action) {
      action.status = status
      if (output) {
        action.output = this.truncateContent(output)
      }
      logger.debug(`[ActionStore] Updated action status: ${action.actionType} -> ${status}`)
    }
  }

  getActions(): ModelAction[] {
    return [...this.actions]
  }

  getActionsByType(actionType: ModelActionType): ModelAction[] {
    return this.actions.filter(a => a.actionType === actionType)
  }

  getActionsBySource(sourceType: 'main' | 'sub'): ModelAction[] {
    return this.actions.filter(a => a.source.type === sourceType)
  }

  getRunningActions(): ModelAction[] {
    return this.actions.filter(a => a.status === 'running')
  }

  clear(): void {
    this.actions = []
    logger.info('[ActionStore] Cleared')
  }

  getStats(): { count: number; byType: Record<ModelActionType, number> } {
    const byType = this.actions.reduce((acc, action) => {
      acc[action.actionType] = (acc[action.actionType] || 0) + 1
      return acc
    }, {} as Record<ModelActionType, number>)

    return {
      count: this.actions.length,
      byType
    }
  }

  private enforceMaxItems(): void {
    if (this.actions.length > this.config.maxItems) {
      const excess = this.actions.length - this.config.maxItems
      this.actions = this.actions.slice(excess)
    }
  }

  private truncateContent(content: string): string {
    if (content.length <= this.config.maxContentLength) return content
    return content.slice(0, this.config.maxContentLength) + '\n...[Truncated]'
  }
}
