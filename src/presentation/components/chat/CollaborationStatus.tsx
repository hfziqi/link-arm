/**
 * Collaboration status container component
 *
 * Responsibilities: Display AGI collaboration panel
 */

import React from 'react'
import { CollaborationPanel } from '../agi/CollaborationPanel'

interface CollaborationStatusProps {
  messageId: string
}

export const CollaborationStatus: React.FC<CollaborationStatusProps> = ({ messageId }) => {
  return (
    <div style={{ maxWidth: '70%' }}>
      <CollaborationPanel messageId={messageId} />
    </div>
  )
}

export default CollaborationStatus
