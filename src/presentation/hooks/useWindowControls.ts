import { useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

interface TauriWindow extends Window {
  __TAURI_INTERNALS__?: {
    [key: string]: unknown
  }
}

export function useWindowControls() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  const handleMinimize = () => {
    const tauriWindow = window as TauriWindow
    if (tauriWindow.__TAURI_INTERNALS__) {
      getCurrentWindow().minimize()
    }
  }

  const handleMaximize = () => {
    const tauriWindow = window as TauriWindow
    if (tauriWindow.__TAURI_INTERNALS__) {
      getCurrentWindow().toggleMaximize()
    }
  }

  const handleClose = () => {
    const tauriWindow = window as TauriWindow
    if (tauriWindow.__TAURI_INTERNALS__) {
      getCurrentWindow().close()
    }
  }

  const handleMouseEnter = (button: string) => {
    setHoveredButton(button)
  }

  const handleMouseLeave = () => {
    setHoveredButton(null)
  }

  return {
    hoveredButton,
    handleMinimize,
    handleMaximize,
    handleClose,
    handleMouseEnter,
    handleMouseLeave
  }
}
