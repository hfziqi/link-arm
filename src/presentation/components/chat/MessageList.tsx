import React, { useCallback, useMemo } from 'react';
import { MessageComponent } from './Message';
import { componentStyles } from '../../styles';
import { useChatStore } from '../../../stores';
// Use Application layer Hook, no longer directly importing Domain layer services
import { useMergedMessages, type MessageGroup } from '../../../application/hooks/useMessageOperations';
import { useMessageListScroll } from '../../../hooks/useMessageListScroll';

interface MessageListProps {
  // All data is now fetched from Store, no props needed
}

export const MessageList: React.FC<MessageListProps> = () => {
  const styles = componentStyles.createMessageListStyles();

  // Get state from Chat Store
  const activeConversationId = useChatStore(state => state.activeConversationId)
  const messagesByConversation = useChatStore(state => state.messagesByConversation)
  const loadMessages = useChatStore(state => state.loadMessages)

  // Use Application layer Hook to get grouped messages (UI layer single message mode)
  const rawMessages = useMemo(() => {
    if (!activeConversationId) return []
    return messagesByConversation[activeConversationId] || []
  }, [messagesByConversation, activeConversationId])
  const messageGroups = useMergedMessages(rawMessages)

  // Use scroll management Hook (minimal solution)
  const {
    containerRef,
    messagesEndRef,
    handleScroll: handleScrollBase
  } = useMessageListScroll({
    conversationId: activeConversationId,
    messageCount: messageGroups.length
  });

  // Scroll handling (merged with load more messages logic)
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;

    handleScrollBase();

    // Handle loading more messages
    if (scrollTop === 0 && activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId, loadMessages, handleScrollBase]);

  return (
    <div style={styles.container}>
      <div 
        style={styles.messageList} 
        className="message-list-container" 
        ref={containerRef}
        onScroll={messageGroups.length > 0 ? handleScroll : undefined}
      >
        {messageGroups.map((group) => (
          <div key={group.id}>
            <MessageGroupComponent group={group} />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

interface MessageGroupComponentProps {
  group: MessageGroup;
}

const MessageGroupComponent: React.FC<MessageGroupComponentProps> = ({ group }) => {
  // Convert MessageGroup to Message format for MessageComponent
  const message = useMemo(() => ({
    id: group.id,
    role: group.role,
    content: group.content,
    modelId: group.modelId,
    reasoningContent: group.reasoningContent,
    conversationId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'sent' as const,
    isTemp: false,
    _isStreaming: group.isStreaming
  }), [group]);

  return <MessageComponent message={message} />;
};
