export type ModelProvider = 'openai' | 'anthropic' | 'deepseek' | 'google' | 'meta' | 'mistral' | 'qwen' | 'kimi' | 'glm' | 'minimax' | 'linkarm' | 'custom'

export interface ModelLogoInfo {
  provider: ModelProvider
  name: string
  color: string
  icon: string
  iconUrl?: string
}

const modelLogoMap: Record<string, ModelLogoInfo> = {
  'gpt-4o': { provider: 'openai', name: 'GPT-4o', color: '#10a37f', icon: '🤖', iconUrl: '/openai.png' },
  'gpt-4o-mini': { provider: 'openai', name: 'GPT-4o Mini', color: '#10a37f', icon: '🤖', iconUrl: '/openai.png' },
  'gpt-4-turbo': { provider: 'openai', name: 'GPT-4 Turbo', color: '#10a37f', icon: '🤖', iconUrl: '/openai.png' },
  'gpt-4': { provider: 'openai', name: 'GPT-4', color: '#10a37f', icon: '🤖', iconUrl: '/openai.png' },
  'gpt-3.5-turbo': { provider: 'openai', name: 'GPT-3.5', color: '#10a37f', icon: '🤖', iconUrl: '/openai.png' },

  'claude-3-5-sonnet': { provider: 'anthropic', name: 'Claude 3.5 Sonnet', color: '#d4a574', icon: '🟣', iconUrl: '/claude.png' },
  'claude-3-5-sonnet-20241022': { provider: 'anthropic', name: 'Claude 3.5 Sonnet', color: '#d4a574', icon: '🟣', iconUrl: '/claude.png' },
  'claude-3-opus': { provider: 'anthropic', name: 'Claude 3 Opus', color: '#d4a574', icon: '🟣', iconUrl: '/claude.png' },
  'claude-3-sonnet': { provider: 'anthropic', name: 'Claude 3 Sonnet', color: '#d4a574', icon: '🟣', iconUrl: '/claude.png' },
  'claude-3-haiku': { provider: 'anthropic', name: 'Claude 3 Haiku', color: '#d4a574', icon: '🟣', iconUrl: '/claude.png' },

  'deepseek-chat': { provider: 'deepseek', name: 'DeepSeek Chat', color: '#4f46e5', icon: '🔮', iconUrl: '/deepseek.png' },
  'deepseek-reasoner': { provider: 'deepseek', name: 'DeepSeek R1', color: '#4f46e5', icon: '🔮', iconUrl: '/deepseek.png' },
  'deepseek-r1': { provider: 'deepseek', name: 'DeepSeek R1', color: '#4f46e5', icon: '🔮', iconUrl: '/deepseek.png' },

  'gemini-pro': { provider: 'google', name: 'Gemini Pro', color: '#4285f4', icon: '🔷', iconUrl: '/gemini.png' },
  'gemini-ultra': { provider: 'google', name: 'Gemini Ultra', color: '#4285f4', icon: '🔷', iconUrl: '/gemini.png' },

  'llama-3': { provider: 'meta', name: 'Llama 3', color: '#0668e1', icon: '🦙' },
  'llama-2': { provider: 'meta', name: 'Llama 2', color: '#0668e1', icon: '🦙' },

  'mistral-large': { provider: 'mistral', name: 'Mistral Large', color: '#ff7000', icon: '🌪️' },
  'mistral-medium': { provider: 'mistral', name: 'Mistral Medium', color: '#ff7000', icon: '🌪️' },

  'qwen': { provider: 'qwen', name: 'Qwen', color: '#ff6a00', icon: '📚', iconUrl: '/qwen.png' },
  'qwen-max': { provider: 'qwen', name: 'Qwen Max', color: '#ff6a00', icon: '📚', iconUrl: '/qwen.png' },
  'qwen-plus': { provider: 'qwen', name: 'Qwen Plus', color: '#ff6a00', icon: '📚', iconUrl: '/qwen.png' },

  'kimi': { provider: 'kimi', name: 'Kimi', color: '#00b4ff', icon: '🌙', iconUrl: '/kimi.png' },
  'kimi-chat': { provider: 'kimi', name: 'Kimi Chat', color: '#00b4ff', icon: '🌙', iconUrl: '/kimi.png' },

  'glm': { provider: 'glm', name: 'ChatGLM', color: '#1a56db', icon: '🔹', iconUrl: '/glm.png' },
  'glm-4': { provider: 'glm', name: 'GLM-4', color: '#1a56db', icon: '🔹', iconUrl: '/glm.png' },
  'chatglm': { provider: 'glm', name: 'ChatGLM', color: '#1a56db', icon: '🔹', iconUrl: '/glm.png' },

  'minimax': { provider: 'minimax', name: 'MiniMax', color: '#ff0050', icon: '🔴', iconUrl: '/minimax.png' },
  'abab': { provider: 'minimax', name: 'MiniMax', color: '#ff0050', icon: '🔴', iconUrl: '/minimax.png' },
}

const providerDefaults: Record<ModelProvider, Omit<ModelLogoInfo, 'provider'>> = {
  openai: { name: 'OpenAI', color: '#10a37f', icon: '🤖', iconUrl: '/openai.png' },
  anthropic: { name: 'Anthropic', color: '#d4a574', icon: '🟣', iconUrl: '/claude.png' },
  deepseek: { name: 'DeepSeek', color: '#4f46e5', icon: '🔮', iconUrl: '/deepseek.png' },
  google: { name: 'Google', color: '#4285f4', icon: '🔷', iconUrl: '/gemini.png' },
  meta: { name: 'Meta', color: '#0668e1', icon: '🦙' },
  mistral: { name: 'Mistral', color: '#ff7000', icon: '🌪️' },
  qwen: { name: 'Qwen', color: '#ff6a00', icon: '📚', iconUrl: '/qwen.png' },
  kimi: { name: 'Kimi', color: '#00b4ff', icon: '🌙', iconUrl: '/kimi.png' },
  glm: { name: 'ChatGLM', color: '#1a56db', icon: '🔹', iconUrl: '/glm.png' },
  minimax: { name: 'MiniMax', color: '#ff0050', icon: '🔴', iconUrl: '/minimax.png' },
  linkarm: { name: 'Link-Arm', color: '#8b5cf6', icon: '🤖', iconUrl: '/linkarm.png' },
  custom: { name: 'Custom', color: '#6b7280', icon: '🤖' },
}

export function getModelLogoInfo(modelId?: string): ModelLogoInfo {
  if (!modelId) {
    return { provider: 'custom', ...providerDefaults.custom }
  }

  if (modelLogoMap[modelId]) {
    return modelLogoMap[modelId]
  }

  for (const [key, info] of Object.entries(modelLogoMap)) {
    if (modelId.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(modelId.toLowerCase())) {
      return info
    }
  }

  const lowerId = modelId.toLowerCase()
  if (lowerId.includes('gpt') || lowerId.includes('openai')) {
    return { provider: 'openai', ...providerDefaults.openai }
  }
  if (lowerId.includes('claude') || lowerId.includes('anthropic')) {
    return { provider: 'anthropic', ...providerDefaults.anthropic }
  }
  if (lowerId.includes('deepseek')) {
    return { provider: 'deepseek', ...providerDefaults.deepseek }
  }
  if (lowerId.includes('gemini') || lowerId.includes('google')) {
    return { provider: 'google', ...providerDefaults.google }
  }
  if (lowerId.includes('llama') || lowerId.includes('meta')) {
    return { provider: 'meta', ...providerDefaults.meta }
  }
  if (lowerId.includes('mistral')) {
    return { provider: 'mistral', ...providerDefaults.mistral }
  }
  if (lowerId.includes('qwen') || lowerId.includes('alibaba')) {
    return { provider: 'qwen', ...providerDefaults.qwen }
  }
  if (lowerId.includes('kimi') || lowerId.includes('moonshot')) {
    return { provider: 'kimi', ...providerDefaults.kimi }
  }
  if (lowerId.includes('glm') || lowerId.includes('zhipu')) {
    return { provider: 'glm', ...providerDefaults.glm }
  }
  if (lowerId.includes('minimax')) {
    return { provider: 'minimax', ...providerDefaults.minimax }
  }

  return { provider: 'custom', ...providerDefaults.custom }
}

export function getModelColor(modelId?: string): string {
  return getModelLogoInfo(modelId).color
}

export function getModelIcon(modelId?: string): string {
  return getModelLogoInfo(modelId).icon
}

export function getModelIconUrl(modelId?: string): string | undefined {
  return getModelLogoInfo(modelId).iconUrl
}

export function getModelDisplayName(modelId?: string, fallback = 'AI'): string {
  return getModelLogoInfo(modelId).name || fallback
}
