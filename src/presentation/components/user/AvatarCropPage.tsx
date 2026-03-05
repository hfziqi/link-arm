import React, { useState, useRef, useCallback } from 'react';
import { styleUtils } from '../../styles';

export interface AvatarCropPageProps {
  /** Image URL */
  imageUrl: string;
  /** Cancel callback */
  onCancel: () => void;
  /** Confirm callback, returns cropped base64 */
  onConfirm: (croppedImage: string) => void;
}

/**
 * AvatarCropPage Component - Avatar crop modal
 *
 * Centered modal form:
 * - Non-fullscreen, centered display
 * - Square crop area (actual output is square)
 * - Support drag and zoom
 * - Bottom action bar
 */
export const AvatarCropPage: React.FC<AvatarCropPageProps> = ({
  imageUrl,
  onCancel,
  onConfirm
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const CROP_SIZE = 300; // Crop area size (square)
  const OUTPUT_SIZE = 400; // Output avatar size
  const PREVIEW_SIZE = 400; // Preview area size in modal

  // Center image after load
  const handleImageLoad = () => {
    setImageLoaded(true);
    // Calculate initial scale based on image and container size
    if (imageRef.current) {
      const img = imageRef.current;
      const minScale = Math.max(
        CROP_SIZE / img.naturalWidth,
        CROP_SIZE / img.naturalHeight
      );
      setScale(Math.max(minScale, 1));
      setPosition({ x: 0, y: 0 });
    }
  };

  // Calculate cropped image
  const getCroppedImage = useCallback((): string => {
    if (!imageRef.current) return '';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    const img = imageRef.current;
    const imgDisplayWidth = img.naturalWidth * scale;
    const imgDisplayHeight = img.naturalHeight * scale;

    // Preview area center point
    const previewCenterX = PREVIEW_SIZE / 2;
    const previewCenterY = PREVIEW_SIZE / 2;

    // Image top-left position in preview area
    const imgX = previewCenterX - imgDisplayWidth / 2 + position.x;
    const imgY = previewCenterY - imgDisplayHeight / 2 + position.y;

    // Crop area center point
    const cropCenterX = previewCenterX;
    const cropCenterY = previewCenterY;
    const cropHalfSize = CROP_SIZE / 2;

    // Calculate crop area on source image
    const sourceX = (cropCenterX - cropHalfSize - imgX) / scale;
    const sourceY = (cropCenterY - cropHalfSize - imgY) / scale;
    const sourceSize = CROP_SIZE / scale;

    // Draw image (square, not cropped to circle)
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    return canvas.toDataURL('image/png');
  }, [position, scale]);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Handle drag move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setPosition({ x: newX, y: newY });
  }, [isDragging, dragStart]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale(prev => {
      const newScale = prev + delta;
      // Limit zoom range
      if (imageRef.current) {
        const minScale = Math.max(
          CROP_SIZE / imageRef.current.naturalWidth,
          CROP_SIZE / imageRef.current.naturalHeight
        );
        return Math.max(minScale, Math.min(3, newScale));
      }
      return Math.max(0.5, Math.min(3, newScale));
    });
  };

  // Handle confirm
  const handleConfirm = () => {
    const croppedImage = getCroppedImage();
    if (croppedImage) {
      onConfirm(croppedImage);
    }
  };

  // Handle zoom buttons
  const handleZoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.1));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      if (imageRef.current) {
        const minScale = Math.max(
          CROP_SIZE / imageRef.current.naturalWidth,
          CROP_SIZE / imageRef.current.naturalHeight
        );
        return Math.max(minScale, prev - 0.1);
      }
      return Math.max(0.5, prev - 0.1);
    });
  };

  const styles = {
    backdrop: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modal: {
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    header: {
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      borderBottom: '1px solid #333',
    },
    headerTitle: {
      fontSize: '16px',
      fontWeight: 500,
      color: '#fff',
    },
    headerButton: {
      padding: '6px 14px',
      borderRadius: '4px',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      color: '#999',
    },
    headerButtonPrimary: {
      backgroundColor: styleUtils.color('success'),
      color: '#fff',
    },
    previewContainer: {
      width: `${PREVIEW_SIZE}px`,
      height: `${PREVIEW_SIZE}px`,
      position: 'relative' as const,
      backgroundColor: '#0a0a0a',
      overflow: 'hidden',
      cursor: isDragging ? 'grabbing' : 'grab',
    },
    image: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
      maxWidth: 'none',
      maxHeight: 'none',
      userSelect: 'none' as const,
      pointerEvents: 'none' as const,
    },
    overlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none' as const,
    },
    cropArea: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${CROP_SIZE}px`,
      height: `${CROP_SIZE}px`,
      border: '2px solid rgba(255, 255, 255, 0.9)',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
    },
    cropCorner: {
      position: 'absolute' as const,
      width: '16px',
      height: '16px',
      border: '3px solid #07c160',
    },
    hint: {
      position: 'absolute' as const,
      bottom: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '13px',
      pointerEvents: 'none' as const,
    },
    bottomBar: {
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '32px',
      borderTop: '1px solid #333',
    },
    zoomButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '1px solid #444',
      backgroundColor: '#2a2a2a',
      color: '#fff',
      fontSize: '22px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scaleText: {
      fontSize: '14px',
      color: '#999',
      minWidth: '50px',
      textAlign: 'center' as const,
    },
  };

  return (
    <div style={styles.backdrop} onClick={onCancel}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Top navigation bar */}
        <div style={styles.header}>
          <button
            style={styles.headerButton}
            onClick={onCancel}
          >
            Cancel
          </button>
          <span style={styles.headerTitle}>Crop Avatar</span>
          <button
            style={{ ...styles.headerButton, ...styles.headerButtonPrimary }}
            onClick={handleConfirm}
            disabled={!imageLoaded}
          >
            Confirm
          </button>
        </div>

        {/* Crop area */}
        <div
          ref={containerRef}
          style={styles.previewContainer}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Image to crop"
              style={styles.image}
              onLoad={handleImageLoad}
              draggable={false}
            />
          )}

          {/* Crop box overlay */}
          <div style={styles.overlay}>
            <div style={styles.cropArea}>
              {/* Four corner markers */}
              <div style={{ ...styles.cropCorner, top: -2, left: -2, borderRight: 'none', borderBottom: 'none' }} />
              <div style={{ ...styles.cropCorner, top: -2, right: -2, borderLeft: 'none', borderBottom: 'none' }} />
              <div style={{ ...styles.cropCorner, bottom: -2, left: -2, borderRight: 'none', borderTop: 'none' }} />
              <div style={{ ...styles.cropCorner, bottom: -2, right: -2, borderLeft: 'none', borderTop: 'none' }} />
            </div>
          </div>

          <div style={styles.hint}>Drag to move, scroll to zoom</div>
        </div>

        {/* Bottom action bar */}
        <div style={styles.bottomBar}>
          <button
            style={styles.zoomButton}
            onClick={handleZoomOut}
            title="Zoom out"
          >
            −
          </button>
          <span style={styles.scaleText}>{Math.round(scale * 100)}%</span>
          <button
            style={styles.zoomButton}
            onClick={handleZoomIn}
            title="Zoom in"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
