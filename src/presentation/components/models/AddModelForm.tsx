import React, { useState, useEffect } from 'react'
import { Button } from '../ui'
import { AddModelFormData, ModelProvider, PROVIDER_MODELS } from '../../../domains/models/types/addModel'
import { componentStyles } from '../../styles'
import { useAutoFillBaseUrl } from '../../../domains/models/hooks/useAutoFillBaseUrl'

export interface AddModelFormProps {
  onSubmit: (data: AddModelFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export const AddModelForm: React.FC<AddModelFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<AddModelFormData>({
    provider: '' as ModelProvider,
    modelName: '',
    apiKey: '',
    baseUrl: ''
  })

  useEffect(() => {
    setFormData(prev => ({ ...prev, modelName: '' }))
  }, [formData.provider])

  useAutoFillBaseUrl(formData.provider, (baseUrl) => {
    setFormData(prev => ({ ...prev, baseUrl }))
  })

  const handleChange = (field: keyof AddModelFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const styles = componentStyles.createFormStyles()

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }} style={styles.container}>
      <div style={styles.formGroup}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Provider</label>
        <div style={styles.inputContainer}>
          <select
            value={formData.provider}
            onChange={(e) => handleChange('provider', e.target.value as ModelProvider)}
            disabled={isLoading}
            style={styles.input}
          >
            <option value="">Select provider</option>
            <option value={ModelProvider.OPENAI}>OpenAI</option>
            <option value={ModelProvider.KIMI}>Kimi (Moonshot)</option>
            <option value={ModelProvider.DEEPSEEK}>DeepSeek</option>
            <option value={ModelProvider.GEMINI}>Gemini (Google)</option>
            <option value={ModelProvider.GLM}>GLM (Zhipu AI)</option>
            <option value={ModelProvider.MINIMAX}>MiniMax</option>
          </select>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Model</label>
        <div style={styles.inputContainer}>
          <select
            value={formData.modelName}
            onChange={(e) => handleChange('modelName', e.target.value)}
            disabled={isLoading || !formData.provider}
            style={styles.input}
          >
            <option value="">Select model</option>
            {(PROVIDER_MODELS[formData.provider] || []).map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>API Key</label>
        <div style={styles.inputContainer}>
          <input
            type="password"
            value={formData.apiKey}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            placeholder="Enter API key"
            disabled={isLoading}
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={isLoading}
          style={styles.button}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          disabled={isLoading}
          style={styles.button}
        >
          {isLoading ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </form>
  )
}
