import type { AIModel } from '../../models/types/models.types'
import type { ToolCall, ToolDefinition, ToolExecutionResult } from '../../shared/types/tool.types'

export type { ToolCall, ToolDefinition, ToolExecutionResult }

export interface IToolService {
  execute(toolCall: ToolCall): Promise<ToolExecutionResult>
  getToolDefinitions(): ToolDefinition[]
  registerTool(tool: ToolRegistration): void
  unregisterTool(toolName: string): void
  hasTool(toolName: string): boolean
}

export interface ToolRegistration {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
  handler: (args: any) => Promise<any> | any
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_call_id?: string
  tool_calls?: ToolCall[]
  reasoning_content?: string
}

export interface ModelCallParams {
  model: AIModel
  messages: Message[]
  tools?: ToolDefinition[]
  temperature?: number
  maxTokens?: number
}

export interface ModelResult {
  content: string
  reasoningContent?: string
  toolCalls?: ToolCall[]
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export type StreamCallback = (chunk: string) => void

export interface IModelService {
  callStream(params: ModelCallParams, callback?: StreamCallback): Promise<ModelResult>
  call(params: ModelCallParams): Promise<ModelResult>
  isModelAvailable(modelId: string): boolean
}

export interface SubModelParams {
  model_id: string
  task: string
  context?: string
}

export interface SubModelResult {
  success: boolean
  content: string
  modelId: string
  modelName: string
  toolCalls: Array<{
    name: string
    result: any
  }>
}

export interface ISubModelService {
  execute(params: SubModelParams): Promise<SubModelResult>
  executeParallel(params: SubModelParams[]): Promise<SubModelResult[]>
  recommendModels(task: string, count?: number): Array<{
    id: string
    name: string
    description: string
  }>
}

export interface ModelCard {
  id: string
  name: string
  provider: string
  capabilities: string[]
  skills: string[]
  config: {
    modelName: string
    baseUrl: string
    apiKey?: string
  }
  description?: string
}

export interface IModelCardService {
  generateModelCard(model: AIModel): ModelCard
  generateModelCards(models: AIModel[]): ModelCard[]
  generateModelCardById(modelId: string): Promise<ModelCard | null>
  formatModelCardsForPrompt(models: ModelCard[]): string
}
