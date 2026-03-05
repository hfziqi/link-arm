/**
 * CollaborationPanelView - View component
 *
 * Responsibilities: UI rendering + local state management (expand/collapse)
 * Does not handle data fetching, only receives props
 */

import React, { useState, useMemo, useEffect, useRef } from 'react'
import type { AGISession } from '../../../../domains/agi/store/agi.store'
import type { CollaborationEvent } from '../../../../domains/agi/types/collaboration.types'
import { EventItem } from './EventItem'
import { formatSessionDuration } from './formatters'

export interface CollaborationPanelViewProps {
  session: AGISession
  isActive: boolean
}

export const CollaborationPanelView: React.FC<CollaborationPanelViewProps> = ({
  session,
  isActive
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const contentRef = useRef<HTMLDivElement>(null)

  // Update current time periodically (for real-time duration display)
  useEffect(() => {
    if (!isActive || session.status === 'completed') {
      return
    }

    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, session.status])



  // Calculate content height for animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0)
    }
  }, [isExpanded, session.events.length])

  const duration = useMemo(() => {
    // If session is active, use current time to calculate duration
    const endTime = session.endTime || currentTime
    return formatSessionDuration(session.startTime, endTime)
  }, [session.startTime, session.endTime, currentTime])

  // Get action text for event type (returns different text based on status)
  const getEventActionText = (type: CollaborationEvent['type'], status: CollaborationEvent['status']): string => {
    const actionMap: Record<CollaborationEvent['type'], { running: string; completed: string; failed: string }> = {
      'intent_analyzed': { running: 'Analyzing intent', completed: 'Intent analyzed', failed: 'Intent analysis failed' },
      'decision_made': { running: 'Making decision', completed: 'Decision made', failed: 'Decision failed' },
      'submodel_called': { running: 'Calling sub-model', completed: 'Sub-model called', failed: 'Sub-model call failed' },
      'tool_executing': { running: 'Executing tool', completed: 'Tool executed', failed: 'Tool execution failed' },
      'tool_completed': { running: 'Tool completed', completed: 'Tool completed', failed: 'Tool completion failed' },
      'submodel_completed': { running: 'Sub-model completed', completed: 'Sub-model completed', failed: 'Sub-model completion failed' },
      'submodel_failed': { running: 'Handling sub-model failure', completed: 'Sub-model failure handled', failed: 'Sub-model failure handling failed' },
      'result_evaluated': { running: 'Evaluating result', completed: 'Result evaluated', failed: 'Result evaluation failed' },
      'fallback_triggered': { running: 'Fallback processing', completed: 'Fallback completed', failed: 'Fallback failed' },
      'response_generating': { running: 'Generating response', completed: 'Response generated', failed: 'Response generation failed' }
    }
    return actionMap[type]?.[status] || 'Processing'
  }

  const statusMessage = useMemo(() => {
    const lastEvent = session.events[session.events.length - 1]
    
    if (!lastEvent) {
      return 'Preparing...'
    }

    const actorType = lastEvent.actor.type === 'main' ? 'Main Model' : 'Sub Model'
    const modelName = lastEvent.actor.modelName || ''
    const actor = `${actorType}${modelName ? `(${modelName})` : ''}`

    if (session.status === 'completed') {
      return `${actor} output final result, collaboration completed`
    }

    if (session.status === 'failed') {
      return `${actor} collaboration failed: ${session.error || 'Unknown error'}`
    }

    if (lastEvent.status === 'running') {
      const actionText = getEventActionText(lastEvent.type, lastEvent.status)
      return `${actor} ${actionText}`
    }

    if (lastEvent.status === 'completed') {
      const transitions: Record<CollaborationEvent['type'], string> = {
        'intent_analyzed': `${actor} intent analysis completed, planning...`,
        'decision_made': `${actor} planning completed, executing...`,
        'submodel_called': `${actor} task assigned to sub-model, waiting for result...`,
        'tool_executing': `${actor} tool call successful, processing result...`,
        'tool_completed': `${actor} tool result processed, next step...`,
        'submodel_completed': `${actor} sub-model execution completed, summarizing...`,
        'submodel_failed': `${actor} sub-model execution failed, handling...`,
        'result_evaluated': `${actor} result evaluation completed, deciding...`,
        'fallback_triggered': `${actor} fallback processing started...`,
        'response_generating': `${actor} thinking completed, outputting result...`
      }
      return transitions[lastEvent.type] || `${actor} processing completed, preparing next step...`
    }

    if (lastEvent.status === 'failed') {
      return `${actor} execution failed, handling exception...`
    }

    return 'Preparing...'
  }, [session, duration, getEventActionText])

  return (
    <div style={{
      width: '100%',
      backgroundColor: isActive ? 'rgba(16, 185, 129, 0.03)' : 'transparent',
      borderRadius: '8px',
      margin: '0',
      border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 0, 0, 0.04)'}`,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      fontSize: '12px'
    }}>
      {/* Header */}
      <div
        style={{
          padding: '6px 12px',
          backgroundColor: 'transparent',
          borderBottom: isExpanded ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          minHeight: '28px'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '60px', flexShrink: 0 }}>
          <span style={{ color: '#999', fontSize: '10px' }}>
            {session.events.length > 0 ? `${session.events.filter(e => e.status === 'completed').length}/${session.events.length}` : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minWidth: 0, padding: '0 8px' }}>
          <span style={{ color: '#666', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {statusMessage}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '60px', flexShrink: 0 }}>
          <span style={{ color: '#999', fontSize: '10px' }}>
            {duration}
          </span>
        </div>
      </div>


      <div style={{
        maxHeight: contentHeight,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease'
      }}>
        <div ref={contentRef} style={{ padding: '8px' }}>
          {session.events.length === 0 ? (
            <div style={{
              padding: '12px',
              textAlign: 'center',
              color: '#999',
              fontSize: '11px'
            }}>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>[Waiting]</div>
              <div>Waiting for collaboration to start...</div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {session.events.map((event, idx) => (
                <EventItem
                  key={event.id}
                  event={event}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>
      </div>


      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

export default CollaborationPanelView
