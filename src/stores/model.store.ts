import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AIModel } from '../domains/models/types/models.types'
import { modelOrchestration } from '../domains/models/services/modelOrchestration'
import { handleError } from '../domains/shared/services/errorHandlingService'
import type { ModelProvider } from '../domains/models/types/addModel'

export interface AddModelRequest {
  provider: ModelProvider
  baseUrl: string
  apiKey: string
  modelName: string
}

export interface ModelState {
  models: AIModel[]
  activeModelId: string | null
  isLoading: boolean
}

export interface ModelActions {
  loadModels: () => Promise<void>
  selectModel: (modelId: string) => Promise<void>
  addModel: (modelData: AddModelRequest) => Promise<void>
  deleteModel: (modelId: string) => Promise<void>
  refreshModels: () => Promise<void>
  getActiveModel: () => AIModel | null
  getModelById: (modelId: string) => AIModel | undefined
}

export type ModelStore = ModelState & ModelActions

export const useModelStore = create<ModelStore>()(
  devtools(
    (set, get) => ({
      models: [],
      activeModelId: null,
      isLoading: false,

      loadModels: async () => {
        set({ isLoading: true }, false, 'loadModels/start')
        try {
          const models = await modelOrchestration.getAllModels()
          const savedModelId = await modelOrchestration.getSelectedModelId()
          const activeModelId = savedModelId && models.find(m => m.id === savedModelId)
            ? savedModelId
            : models.length > 0 ? models[0].id : null

          set({
            models,
            activeModelId,
            isLoading: false
          }, false, 'loadModels/success')
        } catch (error) {
          handleError(error, { showToast: false, logToConsole: true, context: { source: 'ModelStore', action: 'loadModels' } })
          set({ isLoading: false }, false, 'loadModels/error')
        }
      },

      selectModel: async (modelId: string) => {
        const { models } = get()
        const model = models.find(m => m.id === modelId)
        if (!model) return

        await modelOrchestration.selectModel(modelId)
        set({ activeModelId: modelId }, false, 'selectModel')
      },

      addModel: async (modelData: AddModelRequest) => {
        await modelOrchestration.addModel(modelData)
        await get().refreshModels()
      },

      deleteModel: async (modelId: string) => {
        await modelOrchestration.deleteModel(modelId)
        await get().refreshModels()
      },

      refreshModels: async () => {
        const models = await modelOrchestration.getAllModels()
        const { activeModelId } = get()

        const validatedModelId = await modelOrchestration.validateActiveModel(activeModelId, models)

        set({
          models,
          activeModelId: validatedModelId || (models.length > 0 ? models[0].id : null)
        }, false, 'refreshModels')
      },

      getActiveModel: () => {
        const { models, activeModelId } = get()
        return models.find(m => m.id === activeModelId) || null
      },

      getModelById: (modelId: string) => {
        return get().models.find(m => m.id === modelId)
      }
    }),
    {
      name: 'ModelStore',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)
