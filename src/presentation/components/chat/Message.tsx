import React from 'react';
import { Avatar } from './Avatar';
import { MessageBubble } from './MessageBubble';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AiMessageActions, UserMessageActions } from './MessageActions';
import { CollaborationStatus } from './CollaborationStatus';
import { componentStyles } from '../../styles';
import { Message as MessageType } from '../../../domains/chat/types/chat.types';
import { useMessageUI } from '../../../domains/chat/hooks/useMessageUI';
import { useModels } from '../../context/ModelsContext';
import { useStreamContent } from '../../../application/services/StreamMessageManager';

interface MessageProps {
  message: MessageType;
}

export const MessageComponent: React.FC<MessageProps> = ({
  message
}) => {
  const { showActions, onMouseEnter, onMouseLeave } = useMessageUI()
  const [showReasoning, setShowReasoning] = React.useState(true)
  const { getModelById } = useModels()
  const isUser = message.role === 'user'
  const styles = componentStyles.createMessageStyles()

  const { content: streamContent, reasoning: streamReasoning, status } = useStreamContent(message.id)
  const isStreaming = status === 'streaming'

  const displayContent = isStreaming ? streamContent : message.content
  const displayReasoning = isStreaming ? streamReasoning : message.reasoningContent

  const modelInfo = message.modelId ? getModelById(message.modelId) : undefined

  return (
    <div
      style={isUser ? styles.userMessageContainer : styles.aiMessageContainer}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Avatar
        type="ai"
        show={!isUser}
        clickable={!isUser && !!displayReasoning}
        onClick={() => !isUser && displayReasoning && setShowReasoning(!showReasoning)}
        logo={modelInfo?.logo}
        name={modelInfo?.name}
      />

      {!isUser && (displayContent || displayReasoning) ? (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <CollaborationStatus messageId={message.id} />
          {isStreaming ? (
            <div style={{ maxWidth: '70%', fontSize: '18px', lineHeight: 1.4, width: 'fit-content' }}>
              {displayReasoning && showReasoning && (
                <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                  {displayReasoning}
                </div>
              )}
              <MarkdownRenderer content={displayContent} />
            </div>
          ) : (
            <MessageBubble
              content={displayContent}
              type="ai"
              actions={showActions && (
                <AiMessageActions
                  message={message}
                />
              )}
              reasoningContent={showReasoning ? displayReasoning : undefined}
              attachments={message.attachments}
            />
          )}
        </div>
      ) : isUser ? (
        <MessageBubble
          content={message.content}
          type="user"
          actions={showActions && (
            <UserMessageActions
              message={message}
            />
          )}
          attachments={message.attachments}
        />
      ) : null}

      <Avatar type="user" show={isUser} />
    </div>
  );
};
