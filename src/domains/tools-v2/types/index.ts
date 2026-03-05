import type { ToolCall, ToolDefinition, ToolExecutionResult } from '../../shared/types/tool.types'

export type { ToolCall, ToolDefinition, ToolExecutionResult }

export interface ToolExecutionContext {
  userId: string
  conversationId?: string
  messageId?: string
  requestId: string
  timestamp: number
}

export type ToolHandler<T = any> = (
  args: T,
  context: ToolExecutionContext
) => Promise<ToolExecutionResult>

export interface ToolRegistration {
  definition: ToolDefinition
  handler: ToolHandler
  category: ToolCategory
  source: string
}

export enum ToolCategory {
  BUSINESS = 'business',
  ORCHESTRATION = 'orchestration',
  EXTERNAL = 'external',
  SYSTEM = 'system',
  FILE_SYSTEM = 'file_system'
}

export interface ToolPlugin {
  name: string
  description: string
  initialize(): Promise<void>
  getTools(): ToolDefinition[]
  execute(toolName: string, args: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult>
  hasTool(toolName: string): boolean
}

export interface ToolPlatformConfig {
  enableLogging?: boolean
  defaultTimeout?: number
}
