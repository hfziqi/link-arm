import React, { useState, useCallback } from 'react';
import { componentStyles, styleUtils } from '../../styles';
import { Icon } from '../icons';
import { useHover } from '../../../hooks/useHover';
import { copyMessage } from '../../../domains/chat/utils/messageActions';
import { Message } from '../../../domains/chat/types/chat.types';
import { useKnowledgeOperations } from '../../../application/hooks/useKnowledgeOperations';

export interface MessageActionsProps {
  message: Message;
  onEnter?: () => void;
  onLeave?: () => void;
}

const ActionButtons: React.FC<MessageActionsProps> = ({
  message
}) => {
  const styles = componentStyles.createMessageActionsStyles();
  const { isHovered: isCopyHovered, bind: copyBind } = useHover();
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (copied) return
    
    await copyMessage(message)
    setCopied(true)
    
    setTimeout(() => {
      setCopied(false)
    }, 1500)
  }, [copied, message])

  return (
    <>
      <button
        style={{
          ...styles.button,
          ...(isCopyHovered ? { backgroundColor: styleUtils.color('hover') } : {})
        }}
        onClick={handleCopy}
        title={copied ? 'Copied' : 'Copy'}
        {...copyBind}
      >
        <Icon name={copied ? 'check' : 'copy'} size={14} />
      </button>
    </>
  );
};

export const AiMessageActions: React.FC<MessageActionsProps> = ({ onEnter, onLeave, ...props }) => {
  const { isHovered: isFolderHovered, bind: folderBind } = useHover();
  const styles = componentStyles.createMessageActionsStyles();
  const [saved, setSaved] = useState(false)
  const { createDocument } = useKnowledgeOperations()

  const handleSaveToKnowledgeBase = useCallback(async () => {
    if (saved) return
    
    const title = `AI_Response_${new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')}`
    
    const result = await createDocument('txt', undefined, { filename: title, content: props.message.content })
    
    if (result.success) {
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
      }, 1500)
    }
  }, [saved, props.message.content, createDocument])

  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        position: 'absolute' as const,
        top: 'calc(100% + 6px)',
        left: '0',
        zIndex: 10,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <ActionButtons {...props} />
      <button
        style={{
          ...styles.button,
          ...(isFolderHovered ? { backgroundColor: styleUtils.color('hover') } : {})
        }}
        onClick={handleSaveToKnowledgeBase}
        title={saved ? 'Saved' : 'Save to Knowledge Base'}
        {...folderBind}
      >
        <Icon name={saved ? 'check' : 'folder'} size={14} />
      </button>
    </div>
  );
};

export const UserMessageActions: React.FC<MessageActionsProps> = ({ onEnter, onLeave, ...props }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        position: 'absolute' as const,
        top: 'calc(100% + 6px)',
        right: '0',
        zIndex: 10,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <ActionButtons {...props} />
    </div>
  );
};
