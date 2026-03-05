import React from 'react';
import { componentStyles } from '../../styles';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const modalStyles = componentStyles.createModalStyles();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={modalStyles.backdrop}
      onClick={handleBackdropClick}
    >
      <div style={modalStyles.container(size)}>
        {title && (
          <div style={modalStyles.header}>
            <h3 style={modalStyles.title}>{title}</h3>
            <button
              onClick={onClose}
              style={modalStyles.closeButton}
            >
              ×
            </button>
          </div>
        )}
        <div style={modalStyles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};
