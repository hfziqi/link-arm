import React from 'react';
import Icon from './Icon';
import { IconButtonProps } from './iconTypes';
import { componentStyles } from '../../styles';

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  onClick,
  children,
  className,
}) => {
  const iconButtonStyles = componentStyles.createIconButtonStyles();

  return (
    <button
      style={{
        ...iconButtonStyles.base,
        ...iconButtonStyles.variants[variant],
        ...iconButtonStyles.sizes[size],
        ...(disabled && iconButtonStyles.disabled),
        ...componentStyles.createIconButtonCursorStyles(disabled),
      }}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      <Icon name={icon} size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
      {children}
    </button>
  );
};

export default IconButton;
