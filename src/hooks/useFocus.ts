import { useState, useCallback, useMemo } from 'react'

export interface UseFocusOptions {
  onFocus?: () => void
  onBlur?: () => void
}

export interface UseFocusReturn {
  isFocused: boolean
  bind: {
    onFocus: () => void
    onBlur: () => void
  }
}

export const useFocus = (options?: UseFocusOptions): UseFocusReturn => {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    options?.onFocus?.()
  }, [options])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    options?.onBlur?.()
  }, [options])

  const bind = useMemo(() => ({
    onFocus: handleFocus,
    onBlur: handleBlur,
  }), [handleFocus, handleBlur])

  return { isFocused, bind }
}
