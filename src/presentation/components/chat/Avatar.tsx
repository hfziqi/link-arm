import React, { useState, useEffect } from 'react';
import { componentStyles, styleUtils } from '../../styles';
import { Icon } from '../icons';
import { storageProvider } from '../../../infrastructure/storage';
import { createLogger } from '../../../domains/shared/utils/logger';

const logger = createLogger('Avatar');

export interface AvatarProps {
  /** Avatar type: user or AI */
  type: 'user' | 'ai';
  /** Whether to show avatar */
  show?: boolean;
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom style */
  style?: React.CSSProperties;
  /** Click event */
  onClick?: () => void;
  /** Whether clickable */
  clickable?: boolean;
  /** Model logo URL (only for AI avatar) */
  logo?: string;
  /** Model name (for alt display) */
  name?: string;
  /** Custom avatar URL (only for user avatar, higher priority than local storage) */
  avatarUrl?: string;
}

/**
 * Avatar Component - Display user or AI avatar
 *
 * Design Notes:
 * - AI avatar: Use logo parameter to display model image, show default icon if not provided
 * - User avatar: Prioritize avatarUrl parameter, otherwise auto load from local storage
 * - Parent component is responsible for querying model info and passing logo/name, this component only renders
 */
export const Avatar: React.FC<AvatarProps> = ({
  type,
  show = true,
  size = 'md',
  style = {},
  onClick,
  clickable = false,
  logo,
  name,
  avatarUrl: propAvatarUrl
}) => {
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);

  // User avatar: Load from local storage (if props not provided)
  useEffect(() => {
    if (type === 'user' && !propAvatarUrl) {
      const loadAvatar = async () => {
        try {
          const deviceId = await storageProvider.getDeviceId();
          const avatarData = await storageProvider.loadRaw(`user_${deviceId}/avatar.png`);
          if (avatarData) {
            setLocalAvatarUrl(avatarData);
          }
        } catch (error) {
          logger.error('Failed to load user avatar:', error);
        }
      };
      loadAvatar();
    }
  }, [type, propAvatarUrl]);

  if (!show) return null;

  const avatarStyles = componentStyles.createAvatarStyles();

  const containerStyle = {
    ...avatarStyles.container,
    ...avatarStyles.size[size],
    ...(type === 'ai' ? avatarStyles.ai : avatarStyles.user),
    ...style,
    cursor: 'default',
    transition: clickable ? 'all 0.2s' : undefined
  };

  // AI avatar: Show image if logo provided, otherwise show default icon
  if (type === 'ai' && logo) {
    return (
      <div style={containerStyle} onClick={clickable ? onClick : undefined}>
        <img
          src={logo}
          alt={name || 'AI'}
          style={{
            width: avatarStyles.iconSize[size],
            height: avatarStyles.iconSize[size],
            objectFit: 'contain'
          }}
        />
      </div>
    );
  }

  // User avatar: Prioritize props, otherwise use local storage
  const userAvatarUrl = propAvatarUrl || localAvatarUrl;
  if (type === 'user' && userAvatarUrl) {
    return (
      <div style={containerStyle} onClick={clickable ? onClick : undefined}>
        <img
          src={userAvatarUrl}
          alt="User avatar"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
    );
  }

  // Default icon
  return (
    <div style={containerStyle} onClick={clickable ? onClick : undefined}>
      {type === 'user' && (
        <Icon name="account-circle" size={24} color={styleUtils.color('success')} />
      )}
      {type === 'ai' && (
        <Icon name="ai" size={24} color={styleUtils.color('primary')} />
      )}
    </div>
  );
};
