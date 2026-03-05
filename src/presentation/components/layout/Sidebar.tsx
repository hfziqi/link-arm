import React from 'react';
import { ChatList } from '../chat/ChatList';
import { componentStyles } from '../../styles';
import { useChatStore, useUIStore } from '../../../stores';

interface SidebarProps {
  onDoubleClickChat?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onDoubleClickChat
}) => {
  const isExpanded = useUIStore(state => state.sidebarExpanded);
  const styles = componentStyles.createSidebarStyles()

  const {
    selectConversation,
    renameConversation,
    deleteConversation,
    createConversation
  } = useChatStore()

  const contentStyle = {
    ...styles.content,
    opacity: isExpanded ? 1 : 0,
    transition: 'opacity 0.2s ease-in-out'
  }

  return (
    <div style={isExpanded ? styles.expandedContainer : styles.collapsedContainer}>
      <div style={contentStyle}>
        <ChatList
          onSelectChat={selectConversation}
          onRenameChat={renameConversation}
          onDeleteChat={deleteConversation}
          onNewChat={createConversation}
          onDoubleClickChat={onDoubleClickChat}
        />
      </div>
    </div>
  )
};
