import { useState, useEffect, useRef, useCallback } from 'react'
import { AIModel } from '../types/models.types'
import { modelOrchestration } from '../services/modelOrchestration'
import type { AddModelRequest } from '../../../stores/model.store'
import { handleError } from '../../shared/services/errorHandlingService'

export interface ModelState {
  models: AIModel[]
  activeModelId: string | null
}

export interface UseModelStateReturn extends ModelState {
  selectModel: (modelId: string) => Promise<void>
  getActiveModel: () => AIModel | null
  getModelById: (modelId: string) => AIModel | undefined
  addModel: (modelData: AddModelRequest) => Promise<void>
  deleteModel: (modelId: string) => Promise<void>
  refreshModels: () => Promise<void>
  refreshModelsAfterAdd: () => Promise<void>
  refreshModelsAfterDelete: () => Promise<void>
}

export function useModelState(): UseModelStateReturn {
  const [models, setModels] = useState<AIModel[]>([])
  const [activeModelId, setActiveModelId] = useState<string | null>(null)
  const isConfigLoaded = useRef(false)

  useEffect(() => {
    const loadModelSelection = async () => {
      if (!isConfigLoaded.current) {
        try {
          const savedModelId = await modelOrchestration.getSelectedModelId()
          if (savedModelId) {
            setActiveModelId(savedModelId)
          }

          isConfigLoaded.current = true
        } catch (error) {
          handleError(error, { showToast: false, logToConsole: true, context: { source: 'useModelState', action: 'loadModelSelection' } })
        }
      }
    }

    loadModelSelection()
  }, [])

  const refreshModels = useCallback(async () => {
    try {
      const newModels = await modelOrchestration.getAllModels()
      setModels(newModels)
      const validatedModelId = await modelOrchestration.validateActiveModel(activeModelId, newModels)

      if (validatedModelId) {
        setActiveModelId(validatedModelId)
      } else if (newModels.length > 0) {
        const defaultModelId = newModels[0].id
        setActiveModelId(defaultModelId)
        await modelOrchestration.selectModel(defaultModelId)
      }
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useModelState', action: 'refreshModels' } })
    }
  }, [activeModelId])

  const refreshModelsAfterAdd = useCallback(async () => {
    try {
      const newModels = await modelOrchestration.getAllModels()
      setModels(newModels)
      const validatedModelId = await modelOrchestration.validateActiveModel(activeModelId, newModels)
      setActiveModelId(validatedModelId)
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useModelState', action: 'refreshModelsAfterAdd' } })
    }
  }, [activeModelId])

  const refreshModelsAfterDelete = useCallback(async () => {
    try {
      const newModels = await modelOrchestration.getAllModels()
      setModels(newModels)
      const validatedModelId = await modelOrchestration.validateActiveModel(activeModelId, newModels)
      setActiveModelId(validatedModelId)
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useModelState', action: 'refreshModelsAfterDelete' } })
    }
  }, [activeModelId])

  const addModel = useCallback(async (modelData: AddModelRequest) => {
    try {
      const newModel = await modelOrchestration.addModel(modelData)
      setActiveModelId(newModel.id)
      await refreshModelsAfterAdd()
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useModelState', action: 'addModel' } })
      throw error
    }
  }, [refreshModelsAfterAdd])

  const deleteModel = useCallback(async (modelId: string) => {
    try {
      await modelOrchestration.deleteModel(modelId)
      setActiveModelId(prevActiveModelId => {
        if (prevActiveModelId === modelId) {
          return null
        }
        return prevActiveModelId
      })
      await refreshModelsAfterDelete()
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useModelState', action: 'deleteModel' } })
      throw error
    }
  }, [refreshModelsAfterDelete])

  const selectModel = async (modelId: string) => {
    setActiveModelId(modelId)
    try {
      await modelOrchestration.selectModel(modelId)
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useModelState', action: 'selectModel' } })
    }
  }

  const getActiveModel = () => {
    if (activeModelId) {
      const activeModel = models.find(m => m.id === activeModelId)
      if (activeModel) {
        return activeModel
      }
      if (models.length === 0) {
        return null
      }
      setActiveModelId(null)
      modelOrchestration.clearSelectedModelId().catch(error => {
        handleError(error, { showToast: false, logToConsole: true, context: { source: 'useModelState', action: 'clearSelectedModelId' } })
      })
    }
    return models[0] || null
  }

  const getModelById = (modelId: string) => {
    return models.find(m => m.id === modelId)
  }

  return {
    models,
    activeModelId,
    selectModel,
    getActiveModel,
    getModelById,
    addModel,
    deleteModel,
    refreshModels,
    refreshModelsAfterAdd,
    refreshModelsAfterDelete
  }
}
