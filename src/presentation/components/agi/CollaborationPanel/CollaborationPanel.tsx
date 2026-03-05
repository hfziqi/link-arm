/**
 * CollaborationPanel - Container component
 *
 * Responsibilities: Data fetching, passing data to view component
 * Does not handle UI rendering logic
 */

import React from 'react'
import { useAGISession, useIsAGISessionActive } from '../../../../domains/agi/store/agi.store'
import { CollaborationPanelView } from './CollaborationPanelView'

export interface CollaborationPanelProps {
  messageId: string
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ messageId }) => {
  const session = useAGISession(messageId)
  const isActive = useIsAGISessionActive(messageId)

  if (!session) {
    return null
  }

  return <CollaborationPanelView session={session} isActive={isActive} />
}

export default CollaborationPanel
