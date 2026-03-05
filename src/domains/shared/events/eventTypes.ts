export interface AppEvents {
  'document:created': {
    documentId: string
    title: string
    fileType: string
  }

  'document:deleted': {
    documentId: string
    affectedConversations: string[]
  }

  'document:updated': {
    documentId: string
    title?: string
    content?: string
  }

  'document:linked': {
    documentId: string
    conversationId: string
  }

  'document:unlinked': {
    documentId: string
    conversationId: string
  }

  'conversation:created': {
    conversationId: string
    title: string
  }

  'conversation:deleted': {
    conversationId: string
  }

  'conversation:updated': {
    conversationId: string
    updates: Partial<any>
  }

  'model:switched': {
    oldModelId: string | null
    newModelId: string
  }

  'model:custom-added': {
    modelId: string
    name: string
  }

  'model:custom-removed': {
    modelId: string
  }

  'user:logged-in': {
    userId: string
    username: string
  }

  'user:logged-out': {
    userId: string
  }
}
