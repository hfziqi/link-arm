import React from 'react';
import { IconProps } from './iconTypes';
import { iconPaths } from './iconPaths';

const ICON_FILTER = 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.15))';

const Icon: React.FC<IconProps> = ({
  name,
  className = '',
  size = 16,
  color = 'currentColor',
  variant = 'auto',
  strokeWidth = 2,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const pathData = iconPaths[name];

  if (!pathData) {
    return null;
  }

  if (name === 'document-txt' || name === 'document-docx') {
    const docColor = name === 'document-docx' ? '#2B579A' : '#5C6BC0';
    const text = name === 'document-docx' ? 'W' : 'TXT';
    const fontSize = name === 'document-docx' ? 18 : 10;

    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 32 40"
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ filter: ICON_FILTER }}
      >
        <path d="M4 1H20L28 9V39H4V1Z" fill="white"/>
        <path d="M20 1V9H28" fill="#E8E8E8"/>
        <text x="16" y="29" fontFamily="Arial, sans-serif" fontSize={fontSize} fontWeight="bold" fill={docColor} textAnchor="middle">{text}</text>
      </svg>
    );
  }

  if (name === 'document-folder') {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ filter: ICON_FILTER }}
      >
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill="#FFC107"/>
      </svg>
    );
  }

  if (name === 'document-task') {
    const taskColor = '#FFC107';
    const text = 'Task';
    const fontSize = 10;

    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 32 40"
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ filter: ICON_FILTER }}
      >
        <path d="M4 1H20L28 9V39H4V1Z" fill="white"/>
        <path d="M20 1V9H28" fill="#E8E8E8"/>
        <path d="M20 1V9H28" fill={taskColor} opacity="0.3"/>
        <text x="16" y="29" fontFamily="Arial, sans-serif" fontSize={fontSize} fontWeight="bold" fill={taskColor} textAnchor="middle" letterSpacing="-0.5">{text}</text>
      </svg>
    );
  }

  const isOutlineIcon = name === 'account-circle' || name === 'folder';
  const styles = variant === 'filled' 
    ? { fill: 'currentColor', stroke: 'none', strokeWidth: '0' }
    : variant === 'outlined'
    ? { fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth.toString() }
    : { fill: isOutlineIcon ? 'none' : 'currentColor', stroke: isOutlineIcon ? 'currentColor' : 'none', strokeWidth: isOutlineIcon ? strokeWidth.toString() : '0' };

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={styles.fill}
      stroke={styles.stroke}
      strokeWidth={styles.strokeWidth}
      xmlns="http://www.w3.org/2000/svg"
      style={{ color }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <path d={pathData} />
    </svg>
  );
};

export default Icon;
