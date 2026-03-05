export interface AIModel {
  id: string
  name: string
  provider: string
  modelName: string
  logo?: string
  apiKey?: string
  baseUrl?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  createdAt?: Date
}

export interface ModelConfig {
  provider: string
  model: string
  apiKey?: string
  baseUrl?: string
  isCustom?: boolean
}
