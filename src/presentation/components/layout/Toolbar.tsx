import React from 'react';
import { Icon } from '../icons';
import { componentStyles, styleUtils } from '../../styles';
import { useHover } from '../../../hooks/useHover';
import { useUIStore } from '../../../stores';
import { AvatarSelector } from '../user';

interface ToolbarProps {
  isAIManagerActive: boolean;
  isKnowledgeBaseActive: boolean;
  onToggleAIManager: () => void;
  onToggleKnowledgeBase: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  isAIManagerActive,
  isKnowledgeBaseActive,
  onToggleAIManager,
  onToggleKnowledgeBase
}) => {
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const styles = componentStyles.createToolbarStyles();
  const interactiveButtonStyles = componentStyles.createInteractiveButtonBase();

  const { isHovered: isAvatarHovered, bind: avatarBind } = useHover();
  const { isHovered: isChatButtonHovered, bind: chatButtonBind } = useHover();
  const { isHovered: isAIButtonHovered, bind: aiButtonBind } = useHover();
  const { isHovered: isKnowledgeBaseButtonHovered, bind: knowledgeBaseButtonBind } = useHover();

  return (
    <div style={styles.container}>
      <div style={styles.topSection}>
        {/* Avatar selector - click to change avatar */}
        <div
          style={{
            ...styles.avatarContainer,
            ...(isAvatarHovered ? { backgroundColor: styleUtils.color('hover') } : {})
          }}
          {...avatarBind}
          title="Click to change avatar"
        >
          <AvatarSelector size="md" />
        </div>

        <div
          onClick={isKnowledgeBaseActive ? onToggleKnowledgeBase : toggleSidebar}
          style={{
            ...interactiveButtonStyles.base,
            ...(isChatButtonHovered ? { backgroundColor: styleUtils.color('hover') } : {})
          }}
          {...chatButtonBind}
          title="Messages"
        >
          <Icon
            name="chat-bubble-outline"
            size={16}
            color={!isAIManagerActive && !isKnowledgeBaseActive ? styleUtils.color('success') : styleUtils.color('disabled')}
          />
        </div>

        <div
          onClick={isKnowledgeBaseActive ? toggleSidebar : onToggleKnowledgeBase}
          style={{
            ...interactiveButtonStyles.base,
            ...(isKnowledgeBaseButtonHovered ? { backgroundColor: styleUtils.color('hover') } : {})
          }}
          {...knowledgeBaseButtonBind}
          title="Knowledge Base"
        >
          <Icon name="folder" size={17} color={isKnowledgeBaseActive ? styleUtils.color('success') : styleUtils.color('disabled')} />
        </div>
      </div>

      <div style={styles.bottomSection}>
        <div
          onClick={isAIManagerActive ? toggleSidebar : onToggleAIManager}
          style={{
            ...interactiveButtonStyles.base,
            ...(isAIButtonHovered ? { backgroundColor: styleUtils.color('hover') } : {})
          }}
          {...aiButtonBind}
          title="Models"
        >
          <Icon name="ai" size={16} color={isAIManagerActive ? styleUtils.color('success') : styleUtils.color('disabled')} />
        </div>
      </div>
    </div>
  );
};
