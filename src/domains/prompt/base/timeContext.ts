/**
 * Time Context - Base Prompt
 * 
 * Purpose: Provide current time information to help model understand time-related tasks
 * 
 * Use cases:
 * - Main model needs to judge if search results are up-to-date
 * - Sub-model executes time-sensitive tasks
 * - Any scenario requiring time context
 */

export interface TimeContextOptions {
  includeTime?: boolean
  includeTimezone?: boolean
}

/**
 * Get current date context
 */
export function getCurrentDate(options: TimeContextOptions = {}): string {
  const { includeTime = false, includeTimezone = false } = options

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }

  if (includeTime) {
    dateOptions.hour = '2-digit'
    dateOptions.minute = '2-digit'
  }

  if (includeTimezone) {
    dateOptions.timeZoneName = 'short'
  }

  return new Date().toLocaleDateString('en-US', dateOptions)
}

/**
 * Time Context Prompt Template
 */
export const TIME_CONTEXT_TEMPLATE = `## Current Time
{currentDate}`

/**
 * Build time context prompt
 */
export function buildTimeContext(options: TimeContextOptions = {}): string {
  return TIME_CONTEXT_TEMPLATE.replace('{currentDate}', getCurrentDate(options))
}
