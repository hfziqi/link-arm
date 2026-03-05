import React, { useCallback } from 'react';
import { Icon } from '../icons';
import { componentStyles, styleUtils } from '../../styles';
import { useChatStore, useUIStore } from '../../../stores';

interface ChatInputProps {
  onSend: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend
}) => {
  const sidebarExpanded = useUIStore(state => state.sidebarExpanded);
  const maxWidth = sidebarExpanded ? 'calc(100vw - 316px)' : 'calc(100vw - 144px)';
  const chatInputStyles = componentStyles.createChatInputStyles();

  // Get state from Chat Store
  const inputValue = useChatStore(state => state.inputValue)
  const setInputValue = useChatStore(state => state.setInputValue)
  const isLoading = useChatStore(state => state.loading)
  const activeConversationId = useChatStore(state => state.activeConversationId)

  // Internal keyboard event handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }, [onSend])

  return (
    <div style={chatInputStyles.container}>
      <div style={chatInputStyles.wrapper(maxWidth)}>
        <div style={chatInputStyles.inner}>
          <div style={chatInputStyles.textFieldWrapper}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=""
              disabled={!activeConversationId || isLoading}
              style={chatInputStyles.textField}
              rows={1}
            />
          </div>

          <div style={chatInputStyles.buttonContainer}>
            <button
              onClick={onSend}
              disabled={inputValue.trim() === '' || isLoading}
              style={chatInputStyles.sendButton(isLoading, inputValue.trim() !== '')}
            >
              <Icon name="send" size={16} color={inputValue.trim() !== '' && !isLoading ? styleUtils.color('white') : styleUtils.color('text.secondary')} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
