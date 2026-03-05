import { useMemo } from 'react'
import { useHover } from './useHover'

export interface UseHoverEffectReturn {
  isHovered: boolean
  bind: {
    onMouseEnter: () => void
    onMouseLeave: () => void
  }
  getStyle: (baseStyle: React.CSSProperties) => React.CSSProperties
}

export const useHoverEffect = (hoverColor: string): UseHoverEffectReturn => {
  const { isHovered, bind } = useHover()

  const getStyle = useMemo(() => {
    return (baseStyle: React.CSSProperties): React.CSSProperties => {
      return {
        ...baseStyle,
        ...(isHovered ? { backgroundColor: hoverColor } : {})
      }
    }
  }, [isHovered, hoverColor])

  return { isHovered, bind, getStyle }
}
