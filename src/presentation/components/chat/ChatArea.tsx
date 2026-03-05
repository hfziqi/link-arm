import React from 'react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { componentStyles } from '../../styles'

interface ChatAreaProps {
  onSendMessage: () => void
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  onSendMessage
}) => {
  const styles = componentStyles.createChatAreaStyles()

  return (
    <div style={styles.container}>
      <div style={styles.messageList}>
        <MessageList />
      </div>

      <ChatInput onSend={onSendMessage} />
    </div>
  )
}
