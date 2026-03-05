import React from 'react'
import { Icon } from '../icons'
import { componentStyles } from '../../styles'
import { useHover } from '../../../hooks/useHover'

interface NewChatButtonProps {
  onClick: () => Promise<void>
  disabled?: boolean
}

export const NewChatButton: React.FC<NewChatButtonProps> = ({
  onClick,
  disabled = false
}) => {
  const styles = componentStyles.createNewChatButtonStyles()
  const { isHovered, bind } = useHover()

  const handleClick = async () => {
    if (disabled) return
    await onClick()
  }

  const baseStyles = disabled ? { ...styles.base, ...styles.disabled } : styles.base

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        ...baseStyles,
        ...(isHovered && !disabled ? baseStyles[':hover'] : {}),
        opacity: disabled ? 0.6 : 1,
      }}
      {...(!disabled && bind)}
    >
      <Icon name="add" size={16} variant="filled" />
      New
    </button>
  )
}
