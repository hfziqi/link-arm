import React from 'react';
import { componentStyles } from '../../styles';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MessageAttachmentCard } from './MessageAttachmentCard';
import type { MessageAttachment } from '../../../domains/chat/types/chat.types';

export interface MessageBubbleProps {
  content: string;
  type: 'user' | 'ai';
  style?: React.CSSProperties;
  actions?: React.ReactNode;
  reasoningContent?: string;
  extraContent?: React.ReactNode;
  attachments?: MessageAttachment[];
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  type,
  style,
  actions,
  reasoningContent,
  extraContent,
  attachments
}) => {
  const styles = componentStyles.createMessageBubbleStyles();

  const bubbleStyle = {
    ...styles.container,
    ...(type === 'user' ? styles.user : styles.ai),
    ...style,
    position: 'relative' as const
  };

  return (
    <div style={bubbleStyle}>
      {reasoningContent && (
        <div style={styles.reasoningContent}>
          {reasoningContent}
        </div>
      )}
      <div style={styles.content}>
        <MarkdownRenderer content={content} />
      </div>
      {/* extraContent displayed after main content */}
      {extraContent}
      {/* Display attachment cards */}
      {attachments && attachments.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          {attachments.map((attachment, index) => (
            <MessageAttachmentCard
              key={attachment.id || index}
              attachment={attachment}
            />
          ))}
        </div>
      )}
      {actions}
    </div>
  );
};
