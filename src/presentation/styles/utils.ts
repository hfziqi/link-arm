/**
 * Style utility class
 * Provides style-related utility methods
 */

import { CSSProperties } from 'react';
import { ThemeConfig, ExtendedCSSProperties } from './theme';

export class StyleUtils {
  private theme: ThemeConfig;

  constructor(theme: ThemeConfig) {
    this.theme = theme;
  }

  getTheme(): ThemeConfig {
    return this.theme;
  }

  createInputStyle(): ExtendedCSSProperties {
    return {
      width: '100%',
      padding: `${this.theme.spacing.sm} ${this.theme.spacing.md}`,
      borderRadius: this.theme.borderRadius.sm,
      border: `1px solid ${this.theme.colors.border}`,
      outline: 'none',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      ':focus': {
        borderColor: this.theme.colors.primary,
        boxShadow: `0 0 0 2px ${this.theme.colors.primary}33`
      }
    };
  }

  createGridLayout(columns: number = 2, gap: string = '16px'): CSSProperties {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: gap
    };
  }

  createAutoFitGridLayout(minMax: string = 'minmax(100px, 1fr)', gap: string = '16px'): CSSProperties {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, ${minMax})`,
      gap: gap
    };
  }

  spacing(size: keyof ThemeConfig['spacing']): string {
    return this.theme.spacing[size];
  }

  color(type: string): string {
    if (type.includes('.')) {
      const [parent, child] = type.split('.');
      const parentValue = this.theme.colors[parent as keyof ThemeConfig['colors']];
      if (typeof parentValue === 'object' && parentValue !== null) {
        return parentValue[child as keyof typeof parentValue] as string;
      }
      return this.theme.colors.primary;
    }
    
    const colorValue = this.theme.colors[type as keyof ThemeConfig['colors']];
    if (typeof colorValue === 'string') {
      return colorValue;
    }
    return this.theme.colors.primary;
  }

  borderRadius(size: keyof ThemeConfig['borderRadius']): string {
    return this.theme.borderRadius[size];
  }

  overlay(type: keyof ThemeConfig['colors']['overlay']): string {
    return this.theme.colors.overlay[type];
  }

  createScrollableContainer() {
    return {
      vertical: {
        flex: 1,
        overflowY: 'auto' as const,
        overflowX: 'hidden' as const,
        minHeight: 0
      },
      auto: {
        flex: 1,
        overflow: 'auto' as const,
        minHeight: 0
      },
      hidden: {
        flex: 1,
        overflow: 'hidden' as const,
        minHeight: 0
      }
    };
  }
}

import { defaultTheme } from './theme';
export const styleUtils = new StyleUtils(defaultTheme);
