import { modelStorage } from '../../models/services/modelStorage'
import { createLogger } from '../../shared/utils/logger'
import type { AIModel } from '../../models/types/models.types'
import type { IModelCardService, ModelCard } from '../types/service.interfaces'

const logger = createLogger('ModelCardService')

function generateModelCardId(modelId: string): string {
  return `agent-${modelId}`
}

function inferCapabilities(model: AIModel): string[] {
  const capabilities: string[] = []
  const modelName = (model.name || model.modelName || '').toLowerCase()

  if (modelName.includes('gpt-4') || modelName.includes('claude')) {
    capabilities.push('General', 'Reasoning', 'Analysis', 'Writing')
  }
  if (modelName.includes('deepseek') || modelName.includes('coder')) {
    capabilities.push('Programming', 'Code', 'Math', 'Algorithm')
  }
  if (modelName.includes('kimi') || modelName.includes('moonshot')) {
    capabilities.push('LongText', 'Writing', 'Summary', 'Reading')
  }
  if (modelName.includes('gemini')) {
    capabilities.push('Multimodal', 'General', 'Analysis')
  }
  if (modelName.includes('qwen') || modelName.includes('Tongyi')) {
    capabilities.push('General', 'Chinese', 'Writing')
  }

  if (capabilities.length === 0) {
    capabilities.push('General')
  }

  return [...new Set(capabilities)]
}

function inferSkills(model: AIModel): string[] {
  const skills: string[] = []
  const modelName = (model.name || model.modelName || '').toLowerCase()

  if (modelName.includes('deepseek') || modelName.includes('coder')) {
    skills.push('javascript', 'python', 'typescript', 'java', 'cpp', 'Algorithm')
  }

  if (modelName.includes('kimi') || modelName.includes('moonshot')) {
    skills.push('LongDocument', 'PaperWriting', 'ReportGeneration')
  }

  if (modelName.includes('gpt-4') || modelName.includes('claude')) {
    skills.push('LogicalReasoning', 'MathCalculation', 'CodeReview', 'TextAnalysis')
  }

  if (modelName.includes('qwen') || modelName.includes('kimi') || modelName.includes('deepseek')) {
    skills.push('ChineseUnderstanding', 'ChineseWriting', 'ClassicalTranslation')
  }

  return [...new Set(skills)]
}

function getModelDescription(model: AIModel): string {
  const capabilities = inferCapabilities(model)
  const skills = inferSkills(model)

  let description = `${model.name || model.modelName} is an AI model provided by ${model.provider}.`
  description += ` Good at: ${capabilities.join(', ')}.`

  if (skills.length > 0) {
    description += ` Skills: ${skills.slice(0, 5).join(', ')}, etc.`
  }

  return description
}

export class ModelCardService implements IModelCardService {
  generateModelCard(model: AIModel): ModelCard {
    const id = generateModelCardId(model.id)
    const capabilities = inferCapabilities(model)
    const skills = inferSkills(model)
    const baseUrl = model.baseUrl || 'https://api.openai.com/v1'

    return {
      id,
      name: model.name || model.modelName || 'Unknown Model',
      provider: model.provider,
      capabilities,
      skills,
      config: {
        modelName: model.modelName || model.name || 'gpt-3.5-turbo',
        baseUrl: baseUrl,
        apiKey: model.apiKey
      },
      description: getModelDescription(model)
    }
  }

  generateModelCards(models: AIModel[]): ModelCard[] {
    return models.map(model => this.generateModelCard(model))
  }

  async generateModelCardById(modelId: string): Promise<ModelCard | null> {
    try {
      const models = await modelStorage.loadUserModels()
      const model = models.find(m => m.id === modelId)

      if (!model) {
        logger.warn(`[ModelCardService] Model not found: ${modelId}`)
        return null
      }

      return this.generateModelCard(model)
    } catch (error) {
      logger.error(`[ModelCardService] Failed to generate model card: ${modelId}`, error)
      return null
    }
  }

  formatModelCardsForPrompt(models: ModelCard[]): string {
    return models.map(model => `
<agent id="${model.id}" name="${model.name}">
  <capabilities>${model.capabilities.join(',')}</capabilities>
  <skills>${model.skills.join(',')}</skills>
  <description>${model.description}</description>
</agent>
`).join('\n')
  }
}

let instance: ModelCardService | null = null

export function getModelCardService(): ModelCardService {
  if (!instance) {
    instance = new ModelCardService()
  }
  return instance
}
