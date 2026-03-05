/**
 * Models domain styles
 * Contains styles for model related components like model grid, model container, model items, etc.
 */

import { ThemeConfig } from './theme';
import { StyleUtils } from './utils';
import { defaultTheme } from './theme';

export class ModelsStyleGenerator {
  private utils: StyleUtils;

  constructor(theme: ThemeConfig = defaultTheme) {
    this.utils = new StyleUtils(theme);
  }

  createModelGridStyles() {
    return {
      container: this.utils.createGridLayout(8, '12px'),
      responsive: {
        tablet: {
          gridTemplateColumns: 'repeat(3, 1fr)'
        },
        mobile: {
          gridTemplateColumns: 'repeat(2, 1fr)'
        }
      }
    };
  }

  createModelContainerStyles() {
    return {
      wrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const
      },
      content: {
        flex: 1,
        overflow: 'auto' as const,
        minHeight: 0,
        paddingTop: '30px',
        paddingLeft: this.utils.spacing('md'),
        paddingRight: this.utils.spacing('md'),
        paddingBottom: this.utils.spacing('md')
      }
    };
  }

  createModelItemStyles() {
    return {
      wrapper: {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center',
        width: '70px',
        gap: '4px',
        cursor: 'default' as const
      },

      wrapperHovered: {
        backgroundColor: '#e0e0e0',
        borderRadius: '6px'
      },

      container: {
        width: '55px',
        height: '55px',
        padding: 0,
        marginTop: '8px',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        cursor: 'default',
        display: 'flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box' as const,
        backgroundColor: this.utils.color('white'),
        border: `1px solid ${this.utils.color('border')}`
      },

      containerRelative: {
        position: 'relative' as const
      },

      content: {
        display: 'flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
      },

      nameBelowCard: {
        fontSize: '12px',
        fontWeight: 500,
        color: this.utils.color('text.primary'),
        textAlign: 'center' as const,
        lineHeight: 1.2,
        wordBreak: 'break-word' as const,
        width: '100%'
      }
    };
  }

  createNewModelsStyles() {
    return {
      wrapper: {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center',
        width: '70px',
        gap: '4px',
        cursor: 'default' as const
      },
      container: {
        width: '55px',
        height: '55px',
        padding: 0,
        borderRadius: '12px',
        border: '2px dashed #d1d5db',
        backgroundColor: 'transparent',
        display: 'flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box' as const
      },
      content: {
        display: 'flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        fontSize: '24px',
        color: '#9ca3af',
        fontWeight: 200,
        lineHeight: 1,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      nameBelowCard: {
        fontSize: '12px',
        fontWeight: 500,
        color: this.utils.color('text.primary'),
        textAlign: 'center' as const,
        lineHeight: 1.2,
        wordBreak: 'break-word' as const,
        width: '100%'
      }
    };
  }
}
