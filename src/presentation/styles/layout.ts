/**
 * Layout domain styles
 * Contains styles for layout related components like app container, sidebar, chat area, toolbar, etc.
 */

import { ThemeConfig } from './theme';
import { StyleUtils } from './utils';
import { defaultTheme } from './theme';

export class LayoutStyleGenerator {
  private utils: StyleUtils;

  constructor(theme: ThemeConfig = defaultTheme) {
    this.utils = new StyleUtils(theme);
  }

  createAppStyles() {
    return {
      container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'row' as const,
        backgroundColor: this.utils.color('background.paper')
      },
      
      mainContent: {
        display: 'flex',
        flex: 1,
        height: '100%',
        overflow: 'hidden'
      }
    };
  }

  createSidebarStyles() {
    const collapsedContainer = {
      flexShrink: 0,
      backgroundColor: this.utils.color('tertiary'),
      borderRight: 'none',
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      position: 'relative' as const,
      width: '0px',
      overflow: 'hidden',
      transition: 'width 0.3s ease-out'
    };

    const expandedContainer = {
      flexShrink: 0,
      backgroundColor: this.utils.color('tertiary'),
      borderRight: `1px solid ${this.utils.color('border')}`,
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      position: 'relative' as const,
      transition: 'width 0.3s ease-out',
      width: '210px',
      overflow: 'hidden'
    };

    return {
      collapsedContainer,
      expandedContainer,
      content: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        transition: 'opacity 0.3s ease'
      },
      mainSection: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        minHeight: 0
      },
      chatList: {
        flex: 1,
        overflowY: 'auto' as const,
        overflowX: 'hidden' as const
      }
    };
  }

  createChatAreaStyles() {
    const scrollable = this.createScrollableContainer();
    
    return {
      container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: this.utils.color('background.paper'),
        height: '100%',
        minHeight: 0,
        overflow: 'hidden'
      },
      
      messageList: {
        ...scrollable.vertical,
        paddingTop: '30px',
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        backgroundColor: this.utils.color('background.paper'),
        display: 'flex',
        flexDirection: 'column' as const,
        gap: this.utils.spacing('sm')
      },
      
      aiThinking: {
        container: {
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '0 16px',
          marginBottom: '16px'
        },
        bubble: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: this.utils.color('background.default'),
          borderRadius: '16px',
          padding: '12px 16px',
          minWidth: '40px'
        },
        spinner: {
          width: '16px',
          height: '16px',
          border: `2px solid ${this.utils.color('border')}`,
          borderTop: `2px solid ${this.utils.color('primary')}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        },
        pulseDot: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        },
        dot: {
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: this.utils.color('text.secondary'),
          animation: 'pulse 1.4s ease-in-out infinite'
        },
        dot1: {
          animationDelay: '0s'
        },
        dot2: {
          animationDelay: '0.2s'
        },
        dot3: {
          animationDelay: '0.4s'
        }
      },
      
      loading: {
        padding: '12px',
        textAlign: 'center' as const,
        color: this.utils.color('text.secondary')
      }
    };
  }

  createToolbarStyles() {
    return {
      container: {
        width: 48,
        backgroundColor: this.utils.color('background.paper'),
        flexShrink: 0,
        borderRight: `1px solid ${this.utils.color('border')}`,
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        height: '100%',
        position: 'relative' as const
      },
      topSection: {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '10px',
        marginTop: '10px',
      },
      middleSection: {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '10px',
        flex: 1,
        justifyContent: 'center',
      },
      avatarContainer: {
        borderRadius: '6px',
        width: 36,
        height: 36,
        margin: '2px 0',
        padding: 0,
        overflow: 'hidden',
        cursor: 'default' as const,
        display: 'flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: this.utils.color('border'),
      },
      chatButtonContainer: {
        borderRadius: '4px',
        width: 32,
        height: 32,
        margin: '10px 0 0 0',
        cursor: 'default' as const,
        display: 'flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      },
      bottomSection: {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px',
      },
      aiButtonContainer: {
        borderRadius: '4px',
        width: 32,
        height: 32,
        cursor: 'default' as const,
        display: 'flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      }
    };
  }

  createScrollableContainer() {
    return this.utils.createScrollableContainer();
  }

  createWindowControlStyles() {
    return {
      container: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        height: '32px',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 0px 0 4px',
        gap: '0px',
        zIndex: 1000,
        WebkitAppRegion: 'drag' as const,
      },
      buttonContainer: {
        display: 'flex',
        gap: '0px',
        WebkitAppRegion: 'no-drag' as const,
      },
      button: {
        width: 50,
        height: 32,
        borderRadius: '0px',
        border: 'none',
        cursor: 'default',
        transition: 'background-color 0.15s ease, color 0.15s ease',
        WebkitAppRegion: 'no-drag' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: '400',
        color: this.utils.color('text.secondary'),
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        backgroundColor: 'transparent',
        outline: 'none',
      },
      minimizeButton: {
        color: this.utils.color('text.secondary'),
        hoverBackgroundColor: this.utils.overlay('hover'),
        hoverColor: this.utils.color('text.primary'),
      },
      maximizeButton: {
        color: this.utils.color('text.secondary'),
        hoverBackgroundColor: this.utils.overlay('hover'),
        hoverColor: this.utils.color('text.primary'),
      },
      closeButton: {
        color: this.utils.color('text.secondary'),
        hoverBackgroundColor: this.utils.color('error'),
        hoverColor: this.utils.color('white'),
      }
    };
  }
}
