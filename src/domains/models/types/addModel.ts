export enum ModelProvider {
  OPENAI = 'OpenAI',
  KIMI = 'Kimi',
  DEEPSEEK = 'DeepSeek',
  GEMINI = 'Gemini',
  GLM = 'GLM',
  MINIMAX = 'MiniMax'
}

export const PROVIDER_MODELS: Record<ModelProvider, string[]> = {
  [ModelProvider.OPENAI]: [
    'gpt-5.2',
    'gpt-5.1'
  ],
  [ModelProvider.KIMI]: [
    'kimi-k2.5'
  ],
  [ModelProvider.DEEPSEEK]: [
    'deepseek-chat',
    'deepseek-coder',
    'deepseek-v3',
    'deepseek-reasoner'
  ],
  [ModelProvider.GEMINI]: [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash'
  ],
  [ModelProvider.GLM]: [
    'glm-5',
    'glm-4.7',
    'glm-4.7-flash'
  ],
  [ModelProvider.MINIMAX]: [
    'MiniMax-M2.5'
  ]
}

export const PROVIDER_CONFIG: Record<ModelProvider, { baseUrl: string; endpoint?: string; extraBody?: Record<string, any> }> = {
  [ModelProvider.OPENAI]: { baseUrl: 'https://api.openai.com/v1' },
  [ModelProvider.KIMI]: { baseUrl: 'https://api.moonshot.cn/v1' },
  [ModelProvider.DEEPSEEK]: { baseUrl: 'https://api.deepseek.com' },
  [ModelProvider.GEMINI]: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
  [ModelProvider.GLM]: { baseUrl: 'https://open.bigmodel.cn/api/paas/v4' },
  [ModelProvider.MINIMAX]: {
    baseUrl: 'https://api.minimaxi.com/v1/text',
    endpoint: '/chatcompletion_v2',
    extraBody: {
      "reasoning_split": true
    }
  }
}

export interface AddModelFormData {
  provider: ModelProvider
  modelName: string
  apiKey: string
  baseUrl: string
}
