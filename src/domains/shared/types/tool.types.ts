export interface BaseToolCall {
  id?: string
  index?: number
  type?: string
  function?: {
    name?: string
    arguments?: string
  }
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, unknown>
      required?: string[]
    }
  }
}

export interface ToolExecutionResult {
  success: boolean
  result: unknown
  error?: string
  duration?: number
}

export function isValidToolCall(obj: unknown): obj is ToolCall {
  if (!obj || typeof obj !== 'object') return false
  const tc = obj as Record<string, unknown>
  return (
    typeof tc.id === 'string' &&
    tc.type === 'function' &&
    typeof tc.function === 'object' &&
    tc.function !== null &&
    typeof (tc.function as Record<string, unknown>).name === 'string' &&
    typeof (tc.function as Record<string, unknown>).arguments === 'string'
  )
}

export function isBaseToolCall(obj: unknown): obj is BaseToolCall {
  if (!obj || typeof obj !== 'object') return false
  const tc = obj as BaseToolCall
  return (
    (tc.id === undefined || typeof tc.id === 'string') &&
    (tc.type === undefined || typeof tc.type === 'string') &&
    (tc.function === undefined || typeof tc.function === 'object')
  )
}

export function toToolCall(base: BaseToolCall): ToolCall | null {
  if (!base.id || !base.function?.name) return null
  return {
    id: base.id,
    type: 'function',
    function: {
      name: base.function.name,
      arguments: base.function.arguments || ''
    }
  }
}

export function toToolCalls(bases: BaseToolCall[]): ToolCall[] {
  return bases.map(toToolCall).filter((tc): tc is ToolCall => tc !== null)
}
