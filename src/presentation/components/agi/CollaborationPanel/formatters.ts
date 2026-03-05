import type { CollaborationEventType, CollaborationEventStatus } from '../../../../domains/agi/types/collaboration.types'

export function getEventIcon(type: CollaborationEventType): string {
  const icons: Record<CollaborationEventType, string> = {
    'intent_analyzed': 'Analyze',
    'decision_made': 'Decide',
    'submodel_called': 'Call',
    'tool_executing': 'Execute',
    'tool_completed': 'Complete',
    'submodel_completed': 'Complete',
    'submodel_failed': 'Failed',
    'result_evaluated': 'Evaluate',
    'fallback_triggered': 'Fallback',
    'response_generating': 'Generate'
  }
  return icons[type] || 'Event'
}

export function getStatusColor(status: CollaborationEventStatus): string {
  const colors: Record<CollaborationEventStatus, string> = {
    'running': '#1890ff',
    'completed': '#52c41a',
    'failed': '#ff4d4f'
  }
  return colors[status]
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatDuration(ms?: number): string {
  if (!ms) return ''
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function formatSessionDuration(startTime: number, endTime?: number): string {
  const end = endTime || Date.now()
  const duration = end - startTime
  if (duration < 1000) return `${duration}ms`
  if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`
  return `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`
}
