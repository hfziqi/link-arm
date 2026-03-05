import type { ToolCall } from '../../../../shared/types/tool.types'

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool'

export type ModelActionType =
  | 'analyze_intent'
  | 'make_decision'
  | 'call_submodel'
  | 'evaluate_result'
  | 'reflect'
  | 'fallback'
  | 'call_tool'
  | 'receive_task'
  | 'complete_task'
  | 'fail_task'
  | 'main_model_thinking'
  | 'process_tool_result'
  | 'submodel_start'
  | 'tool_call_start'
  | 'tool_call_result'
  | 'submodel_complete'

export interface MessageSource {
  modelId: string
  modelName: string
  type: 'main' | 'sub'
  callDepth: number
}

export interface ModelAction {
  id: string
  actionType: ModelActionType
  source: MessageSource
  description: string
  input?: string
  output?: string
  status?: 'running' | 'completed' | 'failed'
  relatedMessageId?: string
  relatedExecutionId?: string
  metadata?: Record<string, any>
  timestamp: number
}

export interface AGIMessage {
  role: MessageRole
  content: string
  source: MessageSource
  toolCalls?: ToolCall[]
  toolCallId?: string
  reasoningContent?: string
  relatedActionIds?: string[]
  timestamp: number
}

export interface ToolResult {
  toolCallId: string
  toolName: string
  result: any
  success: boolean
  error?: string
  duration: number
  timestamp: number
  executedBy: MessageSource
}

export interface SubModelExecution {
  id: string
  modelId: string
  modelName: string
  task: string
  status: 'running' | 'completed' | 'failed'
  result?: string
  toolCalls: ToolResult[]
  startTime: number
  endTime?: number
  quality?: ResultQuality
  qualityAssessment?: QualityAssessment
}

export type ResultQuality = 'excellent' | 'good' | 'fair' | 'poor'

export interface QualityAssessment {
  quality: ResultQuality
  score: number
  reason: string
  suggestion: 'accept' | 'retry' | 'escalate'
  assessedBy: MessageSource
  timestamp: number
}

export interface CallChainNode {
  id: string
  parentId?: string
  modelId: string
  modelName: string
  depth: number
  task: string
  status: 'running' | 'completed' | 'failed'
  result?: string
}

export interface DecisionRecord {
  id: string
  type: 'task_routing' | 'tool_selection' | 'submodel_selection' | 'fallback'
  description: string
  reasoning: string
  input: string
  output: string
  executed: boolean
  executionResult?: string
  timestamp: number
}

export interface ReflectionRecord {
  id: string
  targetId: string
  content: string
  issues?: string[]
  suggestions?: string[]
  timestamp: number
}

export interface MemoryStats {
  messageCount: number
  actionCount: number
  decisionCount: number
  toolCallCount: number
  subModelCallCount: number
  reflectionCount: number
  totalContentLength: number
  maxCallDepth: number
}

export interface MemoryConfig {
  maxMessages?: number
  maxContentLength?: number
  maxToolResultLength?: number
  sessionId: string
}

export interface BaseStoreConfig {
  maxItems?: number
  maxContentLength?: number
}
