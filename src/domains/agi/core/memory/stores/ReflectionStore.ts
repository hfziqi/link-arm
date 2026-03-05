import { createLogger } from '../../../../shared/utils/logger'
import type { ReflectionRecord, BaseStoreConfig } from '../types/memory.types'

const logger = createLogger('ReflectionStore')

export class ReflectionStore {
  private reflections: ReflectionRecord[] = []
  private config: Required<BaseStoreConfig>

  constructor(config: BaseStoreConfig = {}) {
    this.config = {
      maxItems: config.maxItems || 100,
      maxContentLength: config.maxContentLength || 10000
    }
  }

  record(
    targetId: string,
    content: string,
    issues?: string[],
    suggestions?: string[]
  ): ReflectionRecord {
    const reflection: ReflectionRecord = {
      id: `reflection_${Date.now()}`,
      targetId,
      content: this.truncateContent(content),
      issues,
      suggestions,
      timestamp: Date.now()
    }

    this.reflections.push(reflection)
    this.enforceMaxItems()

    logger.debug(`[ReflectionStore] Recorded reflection for target: ${targetId}`)
    return reflection
  }

  getReflections(): ReflectionRecord[] {
    return [...this.reflections]
  }

  getReflectionsByTarget(targetId: string): ReflectionRecord[] {
    return this.reflections.filter(r => r.targetId === targetId)
  }

  getReflectionsWithIssues(): ReflectionRecord[] {
    return this.reflections.filter(r => r.issues && r.issues.length > 0)
  }

  clear(): void {
    this.reflections = []
    logger.info('[ReflectionStore] Cleared')
  }

  getStats(): { count: number; withIssues: number } {
    const withIssues = this.reflections.filter(r => r.issues && r.issues.length > 0).length
    return {
      count: this.reflections.length,
      withIssues
    }
  }

  private enforceMaxItems(): void {
    if (this.reflections.length > this.config.maxItems) {
      const excess = this.reflections.length - this.config.maxItems
      this.reflections = this.reflections.slice(excess)
    }
  }

  private truncateContent(content: string): string {
    if (content.length <= this.config.maxContentLength) return content
    return content.slice(0, this.config.maxContentLength) + '\n...[Truncated]'
  }
}
