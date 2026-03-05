/**
 * Thinking Process - Base Prompt
 * 
 * Purpose: Guide the model to think deeply before acting
 * 
 * Integrated content:
 * - Tool call decision steps (originally toolStrategy)
 */

export interface ThinkingProcessOptions {
  role?: 'ceo' | 'executor' | 'default'
}

/**
 * CEO Thinking Process
 */
export const CEO_THINKING_PROCESS = [
  'Understand user intent and context',
  'Determine if user requests a specific sub-model to execute task (e.g., "let kimi search")',
  'Determine if code/project creation is needed (e.g., "write a component", "create a project")',
  'Evaluate task complexity and resource requirements',
  'Develop step-by-step execution plan',
  'Decide whether to delegate sub-tasks',
  'Self-reflect on plan feasibility'
]

/**
 * Executor Thinking Process
 */
export const EXECUTOR_THINKING_PROCESS = [
  'Clarify task objectives and constraints',
  'Determine if task involves code creation',
  'Check if required tools are available',
  'Plan operation steps',
  'Anticipate possible errors'
]

/**
 * Base Thinking Process
 */
export const BASE_THINKING_PROCESS = [
  'Analyze the problem',
  'Develop a plan',
  'Execute and verify'
]

/**
 * Thinking Process Template
 */
export const THINKING_PROCESS_TEMPLATE = `## Thinking Process
{thinkingProcess}`

/**
 * Build thinking process prompt
 */
export function buildThinkingProcess(options: ThinkingProcessOptions = {}): string {
  const { role = 'default' } = options

  let process = [...BASE_THINKING_PROCESS]

  if (role === 'ceo') {
    process = [...CEO_THINKING_PROCESS]
  } else if (role === 'executor') {
    process = [...EXECUTOR_THINKING_PROCESS]
  }

  const processText = process.map((step, i) => `${i + 1}. ${step}`).join('\n')

  return THINKING_PROCESS_TEMPLATE.replace('{thinkingProcess}', processText)
}
