/**
 * EventItem - Event item component
 *
 * Responsibilities: Pure UI rendering, receives props, no business logic
 */

import React from 'react'
import type { CollaborationEvent } from '../../../../domains/agi/types/collaboration.types'
import { getStatusColor } from './formatters'
import { getModelLogoInfo } from '../../../../domains/shared/utils/modelLogo'

export interface EventItemProps {
  event: CollaborationEvent
  index?: number
}

export const EventItem: React.FC<EventItemProps> = ({ event, index }) => {
  const isRunning = event.status === 'running'
  const modelLogo = getModelLogoInfo(event.actor.modelName)

  return (
    <div
      style={{
        padding: '4px 6px',
        borderLeft: `2px solid ${getStatusColor(event.status)}`,
        backgroundColor: isRunning ? 'rgba(236, 253, 245, 0.8)' : '#f9f9f9',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        border: `1px solid ${isRunning ? 'rgba(16, 185, 129, 0.3)' : '#e0e0e0'}`,
        width: 'calc(50% - 3px)',
        minHeight: '28px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '100%' }}>
        {index !== undefined && (
          <span style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {index + 1}
          </span>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontWeight: 500,
              flex: 1,
              fontSize: '11px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {event.title}
            </span>
            {modelLogo.iconUrl ? (
              <img
                src={modelLogo.iconUrl}
                alt={modelLogo.name}
                title={modelLogo.name}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
            ) : (
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: modelLogo.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  flexShrink: 0
                }}
                title={modelLogo.name}
              >
                {modelLogo.icon}
              </span>
            )}
          </div>
          {event.description && (
            <div style={{
              color: '#888',
              fontSize: '10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {event.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventItem
