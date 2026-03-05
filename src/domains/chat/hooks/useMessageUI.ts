import { useState, useCallback, useRef, useEffect } from 'react'

export interface MessageUIState {
  showActions: boolean
}

export interface MessageUICallbacks {
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function useMessageUI(): MessageUIState & MessageUICallbacks {
  const [showActions, setShowActions] = useState(false)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = useCallback(() => {
    setShowActions(true)
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    hideTimerRef.current = setTimeout(() => {
      setShowActions(false)
    }, 500)
  }, [])

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [])

  return {
    showActions,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  }
}
