import { useWindowControls } from '../../hooks/useWindowControls'
import { componentStyles } from '../../styles'

const WINDOW_BUTTONS = [
  { key: 'minimize', label: '−' },
  { key: 'maximize', label: '□' },
  { key: 'close', label: '×' }
] as const

export function WindowControls() {
  const {
    hoveredButton,
    handleMinimize,
    handleMaximize,
    handleClose,
    handleMouseEnter,
    handleMouseLeave
  } = useWindowControls()

  const windowControlStyles = componentStyles.createWindowControlStyles()

  const handleWindowButtonClick = (key: string) => {
    switch (key) {
      case 'minimize': return handleMinimize()
      case 'maximize': return handleMaximize()
      case 'close': return handleClose()
    }
  }

  return (
    <div style={windowControlStyles.container}>
      <div style={windowControlStyles.buttonContainer}>
        {WINDOW_BUTTONS.map(({ key, label }) => {
          const buttonStyle = windowControlStyles[`${key}Button` as keyof typeof windowControlStyles]
          const isHovered = hoveredButton === key
          return (
            <button
              key={key}
              onClick={() => handleWindowButtonClick(key)}
              onMouseEnter={() => handleMouseEnter(key)}
              onMouseLeave={handleMouseLeave}
              style={{
                ...windowControlStyles.button,
                ...buttonStyle,
                backgroundColor: isHovered ? (buttonStyle as { hoverBackgroundColor: string }).hoverBackgroundColor : 'transparent',
                color: isHovered ? (buttonStyle as { hoverColor: string }).hoverColor : (buttonStyle as { color: string }).color
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
