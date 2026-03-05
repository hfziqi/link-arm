import { BaseEntity } from '../../shared/types/common.types'

export interface UserProfile extends BaseEntity {
  username: string
  email?: string
  phone?: string
  avatar?: string
  displayName?: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  login_count: number
  last_login_at?: Date
}

export interface UserSettings {
  user_id: string
  theme: string
  created_at: Date
  updated_at: Date
}

export interface Conversation extends BaseEntity {
  title: string
  messageCount: number
  lastMessagePreview?: string
  modelId?: string
}

export interface MessageAttachment {
  type: 'document' | 'task' | 'video' | 'image' | 'folder'
  id: string
  title: string
  fileType?: 'txt' | 'docx' | 'mp4' | 'png' | 'jpg' | 'gif' | 'webp'
  createdAt?: Date
  parentId?: string
  jobId?: string
}

export interface Message extends BaseEntity {
  conversationId: string
  content: string
  role: 'user' | 'assistant' | 'tool'
  modelId?: string
  reasoningContent?: string
  tool_calls?: Array<{
    id: string
    type: string
    function: {
      name: string
      arguments: string
    }
  }>
  tool_call_id?: string
  attachments?: MessageAttachment[]
  status?: 'sending' | 'sent' | 'failed'
  isTemp?: boolean
  _skipLocalStorage?: boolean
  _isStreaming?: boolean
}

export interface ApiMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  tool_call_id?: string
  tool_calls?: Array<{
    id: string
    type: string
    function: {
      name: string
      arguments: string
    }
  }>
  reasoning_content?: string
}
