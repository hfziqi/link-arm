import { useState, useCallback, useMemo, useRef } from 'react'

export interface UseHoverOptions {
  delay?: number
  onEnter?: () => void
  onLeave?: () => void
}

export interface UseHoverReturn {
  isHovered: boolean
  bind: {
    onMouseEnter: () => void
    onMouseLeave: () => void
  }
}

export const useHover = (options?: UseHoverOptions): UseHoverReturn => {
  const [isHovered, setIsHovered] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleMouseEnter = useCallback(() => {
    if (options?.delay) {
      timeoutRef.current = setTimeout(() => {
        setIsHovered(true)
        options?.onEnter?.()
      }, options.delay)
    } else {
      setIsHovered(true)
      options?.onEnter?.()
    }
  }, [options])

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsHovered(false)
    options?.onLeave?.()
  }, [options])

  const bind = useMemo(() => ({
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  }), [handleMouseEnter, handleMouseLeave])

  return { isHovered, bind }
}
