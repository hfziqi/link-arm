import { useState, useCallback } from 'react'
import { AddModelFormData, ModelProvider } from '../types/addModel'

export interface UseModelFormReturn {
  formData: AddModelFormData
  handleChange: (field: keyof AddModelFormData, value: string) => void
  resetForm: () => void
  isValid: boolean
}

export function useModelForm(): UseModelFormReturn {
  const [formData, setFormData] = useState<AddModelFormData>({
    provider: '' as ModelProvider,
    modelName: '',
    apiKey: '',
    baseUrl: ''
  })

  const handleChange = useCallback((field: keyof AddModelFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      provider: '' as ModelProvider,
      modelName: '',
      apiKey: '',
      baseUrl: ''
    })
  }, [])

  const isValid = Boolean(
    formData.provider &&
    formData.modelName &&
    formData.apiKey
  )

  return {
    formData,
    handleChange,
    resetForm,
    isValid
  }
}
