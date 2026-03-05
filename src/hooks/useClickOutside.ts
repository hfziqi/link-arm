import { useEffect, RefObject } from 'react'

interface UseClickOutsideOptions {
  enabled?: boolean
  onClickOutside: () => void
}

export const useClickOutside = (options: UseClickOutsideOptions & {
  ref: RefObject<HTMLElement>
}) => {
  const { ref, enabled = true, onClickOutside } = options

  useEffect(() => {
    if (!enabled) return

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [ref, enabled, onClickOutside])
}
