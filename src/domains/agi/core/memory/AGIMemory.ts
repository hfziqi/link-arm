import { createLogger } from '../../../shared/utils/logger'
import type { ToolCall } from '../../../shared/types/tool.types'
import type {
  MessageSource,
  ModelActionType,
  ResultQuality,
  MemoryStats,
  MemoryConfig
} from './types/memory.types'

import { MessageStore } from './stores/MessageStore'
import { ActionStore } from './stores/ActionStore'
import { DecisionStore } from './stores/DecisionStore'
import { ReflectionStore } from './stores/ReflectionStore'
import { ToolResultStore } from './stores/ToolResultStore'
import { SubModelStore } from './stores/SubModelStore'

const logger = createLogger('AGIMemory')

const DEFAULT_CONFIG: Partial<MemoryConfig> = {
  maxMessages: 100,
  maxContentLength: 10000,
  maxToolResultLength: 5000
}

export class AGIMemory {
  private messageStore: MessageStore
  private actionStore: ActionStore
  private decisionStore: DecisionStore
  private reflectionStore: ReflectionStore
  private toolResultStore: ToolResultStore
  private subModelStore: SubModelStore
  private config: MemoryConfig

  constructor(config: MemoryConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    this.messageStore = new MessageStore({
      maxItems: this.config.maxMessages,
      maxContentLength: this.config.maxContentLength
    })

    this.actionStore = new ActionStore({
      maxContentLength: this.config.maxContentLength
    })

    this.decisionStore = new DecisionStore({
      maxContentLength: this.config.maxContentLength
    })

    this.reflectionStore = new ReflectionStore({
      maxContentLength: this.config.maxContentLength
    })

    this.toolResultStore = new ToolResultStore({
      maxContentLength: this.config.maxToolResultLength
    })

    this.subModelStore = new SubModelStore({
      maxContentLength: this.config.maxContentLength
    })

    logger.info(`[AGIMemory] Created instance, sessionId: ${this.config.sessionId}`)
  }

  // ========== Message Methods ==========

  addSystemMessage(content: string, source: MessageSource): void {
    this.messageStore.addSystemMessage(content, source)
  }

  addUserMessage(content: string, source: MessageSource): void {
    this.messageStore.addUserMessage(content, source)
  }

  addAssistantMessage(content: string, source: MessageSource, toolCalls?: ToolCall[]): void {
    this.messageStore.addAssistantMessage(content, source, toolCalls)

    if (toolCalls) {
      for (const toolCall of toolCalls) {
        if (toolCall.function.name === 'call_model') {
          this.recordSubModelCallFromTool(toolCall, source)
        }
      }
    }
  }

  getMessages() {
    return this.messageStore.getMessages()
  }

  getMessagesForModel() {
    return this.messageStore.getMessagesForModel()
  }

  // ========== Action Methods ==========

  recordAction(
    actionType: ModelActionType,
    source: MessageSource,
    description: string,
    input?: string,
    output?: string,
    metadata?: Record<string, any>,
    status: 'running' | 'completed' | 'failed' = 'completed'
  ): string {
    return this.actionStore.record(actionType, source, description, input, output, metadata, status)
  }

  updateActionStatus(actionId: string, status: 'running' | 'completed' | 'failed', output?: string): void {
    this.actionStore.updateStatus(actionId, status, output)
  }

  getActions() {
    return this.actionStore.getActions()
  }

  getActionsByType(actionType: ModelActionType) {
    return this.actionStore.getActionsByType(actionType)
  }

  getMainModelActions() {
    return this.actionStore.getActionsBySource('main')
  }

  // ========== Intent Analysis Methods ==========

  recordIntentAnalysis(
    source: MessageSource,
    userInput: string,
    analysis: string,
    identifiedIntent?: string
  ): string {
    return this.actionStore.record(
      'analyze_intent',
      source,
      'Analyzing user intent',
      userInput,
      analysis,
      { identifiedIntent }
    )
  }

  // ========== Decision Methods ==========

  recordDecision(
    source: MessageSource,
    description: string,
    reasoning: string,
    decision: string,
    metadata?: Record<string, any>
  ): string {
    const decisionType = metadata?.decisionType || 'task_routing'
    this.decisionStore.record(description, reasoning, decision, decisionType)

    return this.actionStore.record(
      'make_decision',
      source,
      description,
      reasoning,
      decision,
      metadata
    )
  }

  getDecisions() {
    return this.decisionStore.getDecisions()
  }

  // ========== Reflection Methods ==========

  recordReflection(
    source: MessageSource,
    targetId: string,
    content: string,
    issues?: string[],
    suggestions?: string[]
  ): string {
    this.reflectionStore.record(targetId, content, issues, suggestions)

    return this.actionStore.record(
      'reflect',
      source,
      'Reflection',
      `Reflection target: ${targetId}`,
      content,
      { issues, suggestions }
    )
  }

  getReflections() {
    return this.reflectionStore.getReflections()
  }

  // ========== Tool Result Methods ==========

  addToolResult(
    toolCallId: string,
    toolName: string,
    result: any,
    source: MessageSource,
    success: boolean = true,
    error?: string,
    duration: number = 0
  ): void {
    this.toolResultStore.set(toolCallId, toolName, result, source, success, error, duration)

    const toolResult = this.toolResultStore.get(toolCallId)
    if (toolResult) {
      this.messageStore.addToolResult(toolCallId, toolResult.result, source)
      this.updateSubModelToolResult(toolCallId, toolResult)
    }
  }

  getToolResult(toolCallId: string) {
    return this.toolResultStore.get(toolCallId)
  }

  // ========== SubModel Methods ==========

  recordSubModelCall(
    source: MessageSource,
    targetModelId: string,
    targetModelName: string,
    task: string,
    executionId: string
  ): string {
    this.subModelStore.startExecution(executionId, targetModelId, targetModelName, task, source)

    return this.actionStore.record(
      'call_submodel',
      source,
      `Calling submodel: ${targetModelName}`,
      task,
      `Call initiated, execution ID: ${executionId}`,
      { targetModelId, targetModelName, executionId }
    )
  }

  startSubModelExecution(
    executionId: string,
    modelId: string,
    modelName: string,
    task: string,
    parentSource: MessageSource
  ): void {
    this.subModelStore.startExecution(executionId, modelId, modelName, task, parentSource)
  }

  completeSubModelExecution(executionId: string, result: string, quality?: ResultQuality): void {
    const execution = this.subModelStore.getExecution(executionId)
    if (execution) {
      this.subModelStore.completeExecution(executionId, result, quality)

      this.actionStore.record(
        'complete_task',
        { modelId: execution.modelId, modelName: execution.modelName, type: 'sub', callDepth: 1 },
        'Submodel task completed',
        execution.task,
        result,
        { executionId, quality }
      )
    }
  }

  failSubModelExecution(executionId: string, error: string): void {
    const execution = this.subModelStore.getExecution(executionId)
    if (execution) {
      this.subModelStore.failExecution(executionId, error)

      this.actionStore.record(
        'fail_task',
        { modelId: execution.modelId, modelName: execution.modelName, type: 'sub', callDepth: 1 },
        'Sub-model task failed',
        execution.task,
        error,
        { executionId }
      )
    }
  }

  recordResultEvaluation(
    source: MessageSource,
    executionId: string,
    result: string,
    quality: ResultQuality,
    score: number,
    reason: string,
    suggestion: 'accept' | 'retry' | 'escalate'
  ): string {
    this.subModelStore.setQualityAssessment(executionId, quality, score, reason, suggestion, source)

    return this.actionStore.record(
      'evaluate_result',
      source,
      `Evaluating submodel result: ${quality}`,
      result,
      `Score: ${score}, Suggestion: ${suggestion}`,
      { executionId, quality, score, suggestion }
    )
  }

  recordFallback(
    source: MessageSource,
    originalExecutionId: string,
    reason: string,
    fallbackAction: string
  ): string {
    return this.actionStore.record(
      'fallback',
      source,
      'Main model fallback takeover',
      `Original execution ID: ${originalExecutionId}, reason: ${reason}`,
      fallbackAction,
      { originalExecutionId, reason }
    )
  }

  getSubModelExecution(executionId: string) {
    return this.subModelStore.getExecution(executionId)
  }

  getAllSubModelExecutions() {
    return this.subModelStore.getAllExecutions()
  }

  getCallChain() {
    return this.subModelStore.getCallChain()
  }

  // ========== Stats & Utility Methods ==========

  getStats(): MemoryStats {
    const messageStats = this.messageStore.getStats()
    const actionStats = this.actionStore.getStats()
    const decisionStats = this.decisionStore.getStats()
    const toolStats = this.toolResultStore.getStats()
    const subModelStats = this.subModelStore.getStats()

    return {
      messageCount: messageStats.count,
      actionCount: actionStats.count,
      decisionCount: decisionStats.count,
      toolCallCount: toolStats.count,
      subModelCallCount: subModelStats.count,
      reflectionCount: this.reflectionStore.getStats().count,
      totalContentLength: messageStats.totalLength,
      maxCallDepth: subModelStats.maxDepth
    }
  }

  clear(): void {
    this.messageStore.clear()
    this.actionStore.clear()
    this.decisionStore.clear()
    this.reflectionStore.clear()
    this.toolResultStore.clear()
    this.subModelStore.clear()
    logger.info('[AGIMemory] Cleared')
  }

  // ========== Private Helper Methods ==========

  private recordSubModelCallFromTool(toolCall: ToolCall, source: MessageSource): void {
    try {
      const params = JSON.parse(toolCall.function.arguments)
      const executionId = toolCall.id

      this.recordSubModelCall(
        source,
        params.model_id,
        params.model_id,
        params.task,
        executionId
      )
    } catch (error) {
      logger.warn('[AGIMemory] Failed to record submodel call from tool:', error)
    }
  }

  private updateSubModelToolResult(_toolCallId: string, toolResult: ReturnType<ToolResultStore['get']>): void {
    if (!toolResult) return

    const source = toolResult.executedBy

    // If executed by main model, do not associate with any sub-model execution
    if (source.type === 'main') return

    // If executed by sub-model, find the corresponding running execution
    const execution = this.subModelStore.findRunningExecutionByModelId(source.modelId)
    
    if (execution) {
      this.subModelStore.addToolResult(execution.id, toolResult)
      logger.debug(`[AGIMemory] Associated tool result ${toolResult.toolName} to execution ${execution.id} (Model: ${source.modelId})`)
    } else {
      // This might happen if execution finished before tool result arrived (edge case) or orphaned tool call
      logger.warn(`[AGIMemory] Could not find running execution for model ${source.modelId} to attach tool result ${toolResult.toolName}`)
    }
  }
}

export default AGIMemory
