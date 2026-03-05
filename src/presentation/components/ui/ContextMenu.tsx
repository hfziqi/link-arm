import React, { useState, useEffect } from 'react';
import { componentStyles, styleUtils } from '../../styles';
import type { ContextMenuItem } from '../../../domains/shared/types/ui.types';


export type { ContextMenuItem }

interface ContextMenuProps {
  items: ContextMenuItem[];
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  visible,
  position,
  onClose
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredSubItem, setHoveredSubItem] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  const styles = componentStyles.createChatItemStyles();
  const contextMenuStyle = {
    ...styles.contextMenu,
    left: position.x,
    top: position.y,
  };

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.children && item.children.length > 0) {
      return;
    }
    item.onClick?.();
    onClose();
  };

  return (
    <div style={contextMenuStyle}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{ position: 'relative' }}
        >
          <button
            onClick={() => handleItemClick(item)}
            style={{
              ...styles.menuItem,
              ...(hoveredItem === item.id ? styles.hoverMenuItem : {}),
              ...(item.danger ? { color: styleUtils.color('error') } : {}),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%'
            }}
            onMouseEnter={() => setHoveredItem(item.id)}
          >
            <span>{item.label}</span>
            {item.children && item.children.length > 0 && (
              <span style={{ marginLeft: '12px' }}>›</span>
            )}
          </button>
          {item.children && item.children.length > 0 && hoveredItem === item.id && (
            <div
              style={{
                ...styles.contextMenu,
                position: 'absolute',
                left: '100%',
                top: '0',
                marginLeft: '4px'
              }}
              onMouseEnter={() => setHoveredItem(item.id)}
            >
              {item.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => {
                    child.onClick?.();
                    onClose();
                  }}
                  style={{
                    ...styles.menuItem,
                    ...(hoveredSubItem === child.id ? styles.hoverMenuItem : {}),
                    ...(child.danger ? { color: styleUtils.color('error') } : {})
                  }}
                  onMouseEnter={() => setHoveredSubItem(child.id)}
                  onMouseLeave={() => setHoveredSubItem(null)}
                >
                  {child.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
