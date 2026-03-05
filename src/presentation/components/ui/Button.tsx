import React from 'react';
import { useHover } from '../../../hooks/useHover';
import { componentStyles } from '../../styles';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties & { ':hover'?: React.CSSProperties };
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className,
  style,
  type = 'button',
}) => {
  const { isHovered, bind } = useHover();
  const buttonStyles = componentStyles.createButtonStyles();

  const normalStyle: React.CSSProperties = {};
  const hoverStyle: React.CSSProperties = {};
  
  if (style) {
    Object.keys(style).forEach(key => {
      if (key === ':hover') {
        Object.assign(hoverStyle, style[':hover']);
      } else {
        (normalStyle as any)[key] = (style as any)[key];
      }
    });
  }

  const finalStyle: React.CSSProperties = {
    ...buttonStyles.base,
    ...buttonStyles.variants[variant],
    ...buttonStyles.sizes[size],
    ...(disabled ? buttonStyles.disabled : {}),
    ...(isHovered && !disabled ? buttonStyles.variants[variant][':hover'] : {}),
    ...normalStyle,
    ...(isHovered && !disabled ? hoverStyle : {})
  };

  return (
    <button
      style={finalStyle}
      disabled={disabled}
      onClick={onClick}
      {...bind}
      className={className}
      type={type}
    >
      {children}
    </button>
  );
};
