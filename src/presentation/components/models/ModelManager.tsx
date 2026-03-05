import React, { useState } from 'react';
import { ModelList } from './ModelList';
import { AddModelModal } from './AddModelModal';
import { componentStyles } from '../../styles';
import { AddModelFormData } from '../../../domains/models/types/addModel';
import { AIModel } from '../../../domains/models/types/models.types';
import { ContextMenu, type ContextMenuItem } from '../ui';
import { buildModelManagerContextMenuItems } from '../../../domains/models/utils/menuBuilders';
import { createLogger } from '../../../domains/shared/utils/logger';

const logger = createLogger('ModelManager');

interface ModelManagerProps {
  models: AIModel[];
  activeModelId: string | null;
  onSelectModel: (modelId: string) => void;
  onAddModel: (data: AddModelFormData) => Promise<void>;
  onDeleteModel: (id: string) => Promise<void>;
}

export const ModelManager: React.FC<ModelManagerProps> = ({
  models,
  activeModelId,
  onSelectModel,
  onAddModel,
  onDeleteModel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const handleSubmit = async (data: AddModelFormData) => {
    setIsLoading(true);
    try {
      await onAddModel(data);
      setIsModalOpen(false);
    } catch (error) {
      logger.error('Failed to add model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isModelCard = target.closest('[data-model-item]') !== null;

    if (isModelCard) {
      return;
    }

    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleContextMenuAction = (action: string) => {
    if (action === 'add-model') {
      setIsModalOpen(true);
    }
    setShowContextMenu(false);
  };

  const contextMenuItems: ContextMenuItem[] = buildModelManagerContextMenuItems(handleContextMenuAction);

  const containerStyles = componentStyles.createModelContainerStyles();
  const gridStyles = componentStyles.createModelGridStyles();

  const wrapperStyle = {
    ...containerStyles.wrapper,
    position: 'relative' as const
  };

  return (
    <div style={wrapperStyle} onContextMenu={handleContextMenu}>
      <div style={containerStyles.content}>
        <div style={gridStyles.container}>
          <ModelList
            models={models}
            activeModelId={activeModelId}
            onSelectModel={onSelectModel}
            onDeleteModel={onDeleteModel}
          />
        </div>
      </div>
      <ContextMenu
        items={contextMenuItems}
        visible={showContextMenu}
        position={contextMenuPosition}
        onClose={() => setShowContextMenu(false)}
      />
      <AddModelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};
