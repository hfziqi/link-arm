import { createLogger } from '../../../../shared/utils/logger'
import type { DecisionRecord, BaseStoreConfig } from '../types/memory.types'

const logger = createLogger('DecisionStore')

export class DecisionStore {
  private decisions: DecisionRecord[] = []
  private config: Required<BaseStoreConfig>

  constructor(config: BaseStoreConfig = {}) {
    this.config = {
      maxItems: config.maxItems || 100,
      maxContentLength: config.maxContentLength || 10000
    }
  }

  record(
    description: string,
    reasoning: string,
    decision: string,
    decisionType: DecisionRecord['type'] = 'task_routing'
  ): DecisionRecord {
    const record: DecisionRecord = {
      id: `decision_${Date.now()}`,
      type: decisionType,
      description,
      reasoning: this.truncateContent(reasoning),
      input: this.truncateContent(reasoning),
      output: this.truncateContent(decision),
      executed: false,
      timestamp: Date.now()
    }

    this.decisions.push(record)
    this.enforceMaxItems()

    logger.debug(`[DecisionStore] Recorded decision: ${description}`)
    return record
  }

  markExecuted(decisionId: string, result?: string): void {
    const decision = this.decisions.find(d => d.id === decisionId)
    if (decision) {
      decision.executed = true
      if (result) {
        decision.executionResult = this.truncateContent(result)
      }
      logger.debug(`[DecisionStore] Marked decision as executed: ${decisionId}`)
    }
  }

  getDecisions(): DecisionRecord[] {
    return [...this.decisions]
  }

  getPendingDecisions(): DecisionRecord[] {
    return this.decisions.filter(d => !d.executed)
  }

  getDecisionsByType(type: DecisionRecord['type']): DecisionRecord[] {
    return this.decisions.filter(d => d.type === type)
  }

  clear(): void {
    this.decisions = []
    logger.info('[DecisionStore] Cleared')
  }

  getStats(): { count: number; executed: number; pending: number } {
    const executed = this.decisions.filter(d => d.executed).length
    return {
      count: this.decisions.length,
      executed,
      pending: this.decisions.length - executed
    }
  }

  private enforceMaxItems(): void {
    if (this.decisions.length > this.config.maxItems) {
      const excess = this.decisions.length - this.config.maxItems
      this.decisions = this.decisions.slice(excess)
    }
  }

  private truncateContent(content: string): string {
    if (content.length <= this.config.maxContentLength) return content
    return content.slice(0, this.config.maxContentLength) + '\n...[Truncated]'
  }
}
