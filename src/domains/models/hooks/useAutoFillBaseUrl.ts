import { useEffect, useRef } from 'react'
import { ModelProvider, PROVIDER_CONFIG } from '../types/addModel'

export function useAutoFillBaseUrl(
  provider: ModelProvider,
  onBaseUrlChange: (baseUrl: string) => void
): void {
  const prevProviderRef = useRef<ModelProvider | null>(null)

  useEffect(() => {
    if (provider && provider !== prevProviderRef.current) {
      const defaultBaseUrl = PROVIDER_CONFIG[provider]?.baseUrl || ''
      onBaseUrlChange(defaultBaseUrl)
      prevProviderRef.current = provider
    }
  }, [provider, onBaseUrlChange])
}
