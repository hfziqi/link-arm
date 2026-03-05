import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Avatar } from '../chat/Avatar';
import { AvatarCropPage } from './AvatarCropPage';
import { createLogger } from '../../../domains/shared/utils/logger';
import { storageProvider } from '../../../infrastructure/storage';

const logger = createLogger('AvatarSelector');

export interface AvatarSelectorProps {
  /** Current avatar URL */
  currentAvatarUrl?: string;
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg';
  /** Avatar change callback */
  onAvatarChange?: (avatarUrl: string) => void;
}

/**
 * AvatarSelector Component - User avatar selector
 *
 * Click avatar to directly open file selector, then enter crop page after selecting image
 * - Support drag and zoom to adjust avatar area
 * - Save cropped square avatar
 */
export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatarUrl,
  size = 'md',
  onAvatarChange
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentAvatarUrl);
  const [showCropPage, setShowCropPage] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Load saved avatar
  useEffect(() => {
    const loadSavedAvatar = async () => {
      try {
        // Get device ID, build avatar storage path (same as chat records storage method)
        const deviceId = await storageProvider.getDeviceId();
        const avatarData = await storageProvider.loadRaw(`user_${deviceId}/avatar.png`);
        if (avatarData) {
          setAvatarUrl(avatarData);
        }
      } catch (error) {
        logger.error('Failed to load avatar:', error);
      }
    };
    loadSavedAvatar();
  }, []);

  // Handle avatar click - directly open file selector
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      // Use Tauri file selection dialog
      const selected = await invoke<string | null>('open_document_dialog');
      if (!selected) return;

      // Parse returned JSON data
      const fileData = JSON.parse(selected);
      const { content, fileType } = fileData;

      // Validate file type
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) {
        logger.error('Please select an image file (jpg, png, gif, webp)');
        return;
      }

      // Build base64 data
      const mimeType = fileType === 'jpg' ? 'jpeg' : fileType;
      const base64Data = `data:image/${mimeType};base64,${content}`;

      // Open crop page
      setSelectedImage(base64Data);
      setShowCropPage(true);
    } catch (error) {
      logger.error('Failed to select image:', error);
    }
  };

  // Handle crop complete
  const handleCropConfirm = async (croppedImage: string) => {
    try {
      // Get device ID, build avatar storage path (same as chat records storage method)
      const deviceId = await storageProvider.getDeviceId();
      await storageProvider.saveRaw(`user_${deviceId}/avatar.png`, croppedImage);
      setAvatarUrl(croppedImage);
      onAvatarChange?.(croppedImage);
      setShowCropPage(false);
      logger.info('Avatar saved successfully');
    } catch (error) {
      logger.error('Failed to save avatar:', error);
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    cursor: 'pointer',
    borderRadius: '8px',
    overflow: 'hidden',
  };

  return (
    <>
      <div
        style={containerStyle}
        onClick={handleClick}
      >
        <Avatar
          type="user"
          size={size}
          avatarUrl={avatarUrl}
          clickable={true}
        />
      </div>

      {/* Crop page */}
      {showCropPage && (
        <AvatarCropPage
          imageUrl={selectedImage}
          onCancel={() => setShowCropPage(false)}
          onConfirm={handleCropConfirm}
        />
      )}
    </>
  );
};
