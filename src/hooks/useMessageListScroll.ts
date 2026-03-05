import { useRef, useCallback, useEffect } from 'react';

export interface UseMessageListScrollOptions {
  conversationId: string | null;
  messageCount: number;
}

export interface UseMessageListScrollReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

export function useMessageListScroll({
  conversationId,
  messageCount,
}: UseMessageListScrollOptions): UseMessageListScrollReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isNearBottomRef = useRef(true);
  const currentConversationRef = useRef<string | null>(null);
  const prevMessageCountRef = useRef<number>(0);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
      isNearBottomRef.current = true;
    });
  }, []);

  const checkIsNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    const threshold = 100;
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  const handleScroll = useCallback(() => {
    isNearBottomRef.current = checkIsNearBottom();
  }, [checkIsNearBottom]);

  useEffect(() => {
    if (!conversationId) {
      currentConversationRef.current = null;
      prevMessageCountRef.current = 0;
      return;
    }

    const isConversationChanged = currentConversationRef.current !== conversationId;
    const isNewMessage = messageCount > prevMessageCountRef.current;

    if (isConversationChanged) {
      currentConversationRef.current = conversationId;
      prevMessageCountRef.current = messageCount;

      requestAnimationFrame(() => {
        scrollToBottom('auto');
      });
    } else if (isNewMessage && isNearBottomRef.current) {
      scrollToBottom('smooth');
      prevMessageCountRef.current = messageCount;
    } else {
      prevMessageCountRef.current = messageCount;
    }
  }, [conversationId, messageCount, scrollToBottom]);

  return {
    containerRef,
    messagesEndRef,
    handleScroll,
    scrollToBottom,
  };
}
