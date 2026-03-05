import React from 'react'
import { ChatItem } from './ChatItem'
import { NewChatButton } from './NewChatButton'
import { useChatStore } from '../../../stores'
import { componentStyles } from '../../styles'

interface ChatListProps {
  onSelectChat: (id: string) => void
  onRenameChat: (id: string, newTitle: string) => Promise<void>
  onDeleteChat: (id: string) => Promise<void>
  onNewChat: () => Promise<void>
  onDoubleClickChat?: () => void
}

export const ChatList: React.FC<ChatListProps> = ({
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  onNewChat,
  onDoubleClickChat
}) => {
  const styles = componentStyles.createChatListStyles();

  const conversations = useChatStore(state => state.conversations)
  const activeConversationId = useChatStore(state => state.activeConversationId)

  return (
    <div style={styles.container}>
      <div style={styles.newChatButtonContainer}>
        <NewChatButton
          onClick={onNewChat}
        />
      </div>

      <div style={styles.chatList}>
        {conversations.length === 0 ? (
          <div></div>
        ) : (
          <div style={{ paddingTop: '0px', paddingLeft: '0px', paddingRight: '0px', paddingBottom: '8px' }}>
            {conversations.map((chat) => (
              <ChatItem
                key={chat.id}
                id={chat.id}
                title={chat.title}
                isActive={chat.id === activeConversationId}
                onSelect={onSelectChat}
                onRename={onRenameChat}
                onDelete={onDeleteChat}
                onDoubleClick={onDoubleClickChat}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
