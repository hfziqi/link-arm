/**
 * Theme configuration
 * Defines application theme configuration and types
 */

import { CSSProperties } from 'react';

export interface ExtendedCSSProperties extends CSSProperties {
  ':hover'?: CSSProperties;
  ':focus'?: CSSProperties;
  ':active'?: CSSProperties;
  ':disabled'?: CSSProperties;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    error: string;
    white: string;
    primaryDark: string;
    successDark: string;
    background: {
      paper: string;
      default: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    border: string;
    borderLight: string;
    borderFocus: string;
    borderLightGray: string;
    borderMedium: string;
    hover: string;
    hoverLight: string;
    disabled: string;
    online: string;
    tertiary: string;
    overlay: {
      backdrop: string;
      shadow: string;
      border: string;
      hover: string;
      scrollbar: string;
      scrollbarHover: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
  };
  borderRadius: {
    sm: string;
    md: string;
  };
}

export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#4caf50',
    error: '#f44336',
    white: '#ffffff',
    primaryDark: '#1565c0',
    successDark: '#388e3c',
    background: {
      paper: '#f1f1f1',
      default: '#f5f5f5'
    },
    text: {
      primary: '#000000',
      secondary: '#757575',
      tertiary: '#888888'
    },
    border: '#e0e0e0',
    borderLight: '#93C5FD',
    borderFocus: '#3B82F6',
    borderLightGray: '#ddd',
    borderMedium: '#d1d5db',
    hover: '#e5e5e5',
    hoverLight: '#f0f0f0',
    disabled: '#616161',
    online: '#4CAF50',
    tertiary: '#fcfcfc',
    overlay: {
      backdrop: 'rgba(0, 0, 0, 0.5)',
      shadow: 'rgba(0, 0, 0, 0.15)',
      border: 'rgba(0, 0, 0, 0.05)',
      hover: 'rgba(0, 0, 0, 0.15)',
      scrollbar: 'rgba(0, 0, 0, 0.2)',
      scrollbarHover: 'rgba(0, 0, 0, 0.4)'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '20px',
    lg: '24px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px'
  }
};
