import type { AIModel } from '../../models/types/models.types'
import type { MessageSource } from '../core/memory/types/memory.types'
import type { BusinessToolsDependencies } from '../../tools-v2'

export interface Task {
  id: string
  name: string
  description: string
  type: 'search' | 'analysis' | 'writing' | 'coding' | 'calculation' | 'other'
  input: string
  expectedOutput?: string
  dependencies?: string[]
}

export interface TaskResult {
  taskId: string
  success: boolean
  output: string
  executedBy: 'submodel' | 'mainmodel'
  modelId: string
  modelName: string
  duration: number
  toolCalls?: Array<{
    name: string
    params: any
    result: any
  }>
  error?: string
}

export interface TaskEvaluation {
  score: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  reason: string
  suggestion: 'accept' | 'retry' | 'escalate'
  improvements?: string[]
}

export interface SubModelRole {
  id: string
  name: string
  description: string
  taskTypes: Task['type'][]
  availableTools: string[]
  modelConfig?: {
    temperature?: number
    maxTokens?: number
  }
}

export interface UserIntent {
  originalInput: string
  intent: string
  type: 'question' | 'task' | 'creative' | 'analysis' | 'other'
  entities?: string[]
  complexity: 'simple' | 'medium' | 'complex'
}

export interface ExecutionPlan {
  id: string
  description: string
  tasks: Task[]
  strategy: 'sequential' | 'parallel' | 'mixed'
  estimatedDuration?: number
}

export interface AGIOrchestratorConfig {
  mainModel: AIModel
  subModels?: Map<string, AIModel>
  subModelRoles?: SubModelRole[]
  maxRetries?: number
  qualityThreshold?: number
  enableCollaborationPanel?: boolean
  sessionId?: string
  businessDependencies?: BusinessToolsDependencies
}

export interface OrchestratorState {
  phase: 'idle' | 'analyzing' | 'planning' | 'executing' | 'evaluating' | 'integrating' | 'completed' | 'failed'
  currentTaskIndex: number
  totalTasks: number
  completedTasks: TaskResult[]
  failedTasks: TaskResult[]
  startTime: number
  endTime?: number
}

export interface AGIOrchestratorResult {
  success: boolean
  output: string
  plan: ExecutionPlan
  taskResults: TaskResult[]
  state: OrchestratorState
  totalDuration: number
  error?: string
}

export interface MainModelResponse<T = any> {
  success: boolean
  data: T
  reasoning?: string
  error?: string
}

export interface SubModelExecutor {
  execute(task: Task, model: AIModel, context: MessageSource): Promise<TaskResult>
}

export interface ModelCallOptions {
  temperature?: number
  maxTokens?: number
  stream?: boolean
  systemPrompt?: string
}
