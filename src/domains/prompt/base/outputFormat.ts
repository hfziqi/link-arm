/**
 * Output Format - Base Prompt
 * 
 * Purpose: Define model output format standards
 * 
 * Use cases:
 * - All models need to follow output format
 * - Can customize different output requirements based on role
 */

export interface OutputFormatOptions {
  role?: 'ceo' | 'executor' | 'default'
  useMarkdown?: boolean
}

/**
 * Base Output Format (shared by all models)
 */
export const BASE_OUTPUT_FORMAT = [
  'Keep it concise and professional, avoid redundancy',
  'Use Markdown formatting for output (when needed)'
]

/**
 * CEO Specific Output Format
 */
export const CEO_OUTPUT_FORMAT = [
  'Freely output thinking process',
  'Call corresponding tools when collaboration is needed',
  'Provide a complete, clear response to the user at the end'
]

/**
 * Executor Specific Output Format
 */
export const EXECUTOR_OUTPUT_FORMAT = [
  'Directly provide task results, no redundant explanations',
  'If task is complex, explain step by step',
  'When encountering problems, explain the cause and attempted solutions'
]

/**
 * Output Format Template
 */
export const OUTPUT_FORMAT_TEMPLATE = `## Output Principles
{outputFormat}`

/**
 * Build output format prompt
 */
export function buildOutputFormat(options: OutputFormatOptions = {}): string {
  const { role = 'default', useMarkdown = true } = options

  let formatRules = [...BASE_OUTPUT_FORMAT]

  if (role === 'ceo') {
    formatRules = [...formatRules, ...CEO_OUTPUT_FORMAT]
  } else if (role === 'executor') {
    formatRules = [...formatRules, ...EXECUTOR_OUTPUT_FORMAT]
  }

  if (!useMarkdown) {
    formatRules = formatRules.filter(r => !r.includes('Markdown'))
  }

  const formatText = formatRules.map((r, i) => `${i + 1}. **${r.split(':')[0]}**${r.includes(':') ? ':' + r.split(':').slice(1).join(':') : ''}`).join('\n')

  return OUTPUT_FORMAT_TEMPLATE.replace('{outputFormat}', formatText)
}
