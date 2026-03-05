import { AIModel } from '../types/models.types'

export function getModelDisplayName(model: AIModel): string {
  return model.name || (
    model.provider && model.modelName
      ? `${model.provider} - ${model.modelName}`
      : model.modelName || model.provider || ''
  )
}

export function getModelLogo(model: AIModel): string {
  const providerLogos: Record<string, string> = {
    'kimi': '/kimi.png',
    'deepseek': '/deepseek.png',
    'glm': '/glm.png',
    'minimax': '/minimax.png',
    'qwen': '/qwen.png'
  }

  const providerLower = model.provider?.toLowerCase() || ''
  return providerLogos[providerLower] || '/model-logo.png'
}
