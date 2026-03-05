/**
 * Base UI component styles
 * Contains style definitions for common UI components like Button, Input, Modal, Select, etc.
 */

import { ThemeConfig } from './theme';
import { StyleUtils } from './utils';
import { defaultTheme } from './theme';

export class BaseStyleGenerator {
  private utils: StyleUtils;

  constructor(theme: ThemeConfig = defaultTheme) {
    this.utils = new StyleUtils(theme);
  }

  createButtonStyles() {
    return {
      base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 500,
        borderRadius: this.utils.borderRadius('sm'),
        border: 'none',
        outline: 'none',
        cursor: 'default',
        transition: 'all 0.2s ease',
        userSelect: 'none' as any,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle'
      },
      variants: {
        primary: {
          backgroundColor: this.utils.color('success'),
          color: this.utils.color('white'),
          ':hover': {
            backgroundColor: this.utils.color('successDark')
          }
        },
        secondary: {
          backgroundColor: this.utils.color('background.default'),
          color: this.utils.color('text.primary'),
          border: `1px solid ${this.utils.color('border')}`,
          ':hover': {
            backgroundColor: this.utils.color('border')
          }
        },
        ghost: {
          backgroundColor: 'transparent',
          color: this.utils.color('disabled'),
          ':hover': {
            backgroundColor: this.utils.color('background.default')
          }
        }
      },
      sizes: {
        sm: {
          padding: '6px 12px',
          fontSize: '13px',
          height: '32px'
        },
        md: {
          padding: '8px 16px',
          fontSize: '14px',
          height: '40px'
        },
        lg: {
          padding: '12px 20px',
          fontSize: '16px',
          height: '48px'
        }
      },
      disabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    };
  }

  createInputStyles() {
    return {
      container: {
        width: '100%'
      },
      base: {
        width: '100%',
        padding: `${this.utils.spacing('sm')} ${this.utils.spacing('md')}`,
        borderRadius: '10px',
        border: `1px solid ${this.utils.color('border')}`,
        outline: 'none',
        fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: '1.5',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box' as const,
        backgroundColor: this.utils.getTheme().colors.background.paper,
        color: this.utils.getTheme().colors.text.primary
      },
      focused: {
        borderColor: this.utils.color('border')
      },
      hovered: {
        borderColor: this.utils.color('border')
      },
      disabled: {
        backgroundColor: this.utils.color('background.default'),
        opacity: 0.6,
        cursor: 'not-allowed'
      },
      error: {
        borderColor: this.utils.color('error'),
        boxShadow: `0 0 0 2px ${this.utils.color('error')}33`
      },
      errorMessage: {
        marginTop: this.utils.spacing('xs'),
        fontSize: '12px',
        color: this.utils.color('error'),
        lineHeight: '1.4'
      }
    };
  }

  createModalStyles() {
    return {
      backdrop: {
        position: 'fixed' as const,
        inset: 0,
        backgroundColor: this.utils.overlay('backdrop'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      },
      container: (size: 'sm' | 'md' | 'lg') => ({
        backgroundColor: this.utils.getTheme().colors.background.paper,
        borderRadius: this.utils.borderRadius('md'),
        boxShadow: `0 10px 25px ${this.utils.overlay('shadow')}`,
        width: '100%',
        maxWidth: size === 'sm' ? '400px' : size === 'md' ? '500px' : '600px',
        margin: '0 1rem',
        display: 'flex',
        flexDirection: 'column' as const
      }),
      content: {
        padding: 0,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center'
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: this.utils.spacing('lg'),
        borderBottom: `1px solid ${this.utils.color('border')}`
      },
      title: {
        fontSize: '18px',
        fontWeight: 500,
        color: this.utils.getTheme().colors.text.primary,
        margin: 0
      },
      closeButton: {
        color: this.utils.getTheme().colors.text.secondary,
        fontSize: '24px',
        lineHeight: '1',
        cursor: 'default',
        border: 'none',
        background: 'none',
        padding: this.utils.spacing('xs'),
        borderRadius: this.utils.borderRadius('sm'),
        transition: 'color 0.2s ease'
      },
      closeButtonHover: {
        color: this.utils.getTheme().colors.text.primary
      }
    };
  }

  createIconButtonStyles() {
    return {
      base: {
        display: 'inline-flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        border: 'none',
        transition: 'background-color 0.2s, color 0.2s',
        outline: 'none'
      },
      variants: {
        primary: {
          backgroundColor: this.utils.color('primary'),
          color: this.utils.color('white'),
          ':hover': {
            backgroundColor: this.utils.color('primaryDark')
          }
        },
        secondary: {
          backgroundColor: this.utils.color('background.default'),
          color: this.utils.color('text.primary'),
          ':hover': {
            backgroundColor: this.utils.color('border')
          }
        },
        ghost: {
          backgroundColor: 'transparent',
          color: this.utils.color('disabled'),
          ':hover': {
            backgroundColor: this.utils.color('background.default')
          }
        }
      },
      sizes: {
        sm: {
          padding: '6px'
        },
        md: {
          padding: '8px'
        },
        lg: {
          padding: '12px'
        }
      },
      disabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    };
  }

  createIconButtonCursorStyles(disabled: boolean = false) {
    return {
      cursor: disabled ? 'not-allowed' : 'pointer'
    };
  }

  createAvatarStyles() {
    return {
      container: {
        flexShrink: 0,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      },
      user: {
        backgroundColor: this.utils.color('border'),
        color: this.utils.color('text.tertiary')
      },
      ai: {
        backgroundColor: this.utils.color('background.paper'),
        color: this.utils.color('text.tertiary')
      },
      size: {
        sm: {
          width: '32px',
          height: '32px'
        },
        md: {
          width: '40px',
          height: '40px'
        },
        lg: {
          width: '48px',
          height: '48px'
        }
      },
      iconSize: {
        sm: 32,
        md: 40,
        lg: 48
      }
    };
  }

  createNewModelFormStyles() {
    return {
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: this.utils.spacing('lg'),
        width: '100%',
        alignItems: 'center'
      },
      formGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: this.utils.spacing('xs'),
        width: '100%',
        maxWidth: '400px',
        alignSelf: 'center'
      },
      label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: 500,
        color: this.utils.color('text.primary'),
        marginBottom: this.utils.spacing('xs')
      },
      input: this.utils.createInputStyle(),
      buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
        gap: this.utils.spacing('md'),
        paddingTop: this.utils.spacing('lg'),
        width: '100%'
      },
      button: {
        minWidth: '120px',
        width: '120px'
      },
      errorText: {
        marginTop: this.utils.spacing('xs'),
        fontSize: '12px',
        color: this.utils.color('error'),
        lineHeight: '1.4',
        padding: `0 ${this.utils.spacing('sm')}`
      }
    };
  }

  createInteractiveButtonBase() {
    return {
      base: {
        borderRadius: '6px',
        width: 36,
        height: 36,
        cursor: 'default',
        display: 'flex' as const,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        transition: 'background-color 0.2s ease',
      },
      hover: {
        backgroundColor: this.utils.color('hover'),
      }
    };
  }

  createCursorStyles() {
    return {
      default: {
        cursor: 'default'
      },
      pointer: {
        cursor: 'default'
      },
      notAllowed: {
        cursor: 'not-allowed'
      },
      text: {
        cursor: 'text'
      },
      wait: {
        cursor: 'wait'
      }
    };
  }

  createGlobalAnimationStyles() {
    return {
      spin: {
        keyframes: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      },
      pulse: {
        keyframes: `
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.6;
            }
            50% {
              transform: scale(1.2);
              opacity: 1;
            }
          }
        `
      }
    };
  }

  createGlobalResetStyle() {
    return {
      margin: 0,
      padding: 0,
      boxSizing: 'border-box' as const
    };
  }

  createBodyStyle() {
    return {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      lineHeight: 1.5,
      color: this.utils.getTheme().colors.text.primary,
      backgroundColor: this.utils.getTheme().colors.background.default
    };
  }

  createScrollbarStyles() {
    return {
      width: '6px',
      track: {
        backgroundColor: 'transparent'
      },
      thumb: {
        backgroundColor: this.utils.overlay('scrollbar'),
        borderRadius: '3px'
      },
      thumbHover: {
        backgroundColor: this.utils.overlay('scrollbarHover')
      }
    };
  }

  createScrollableContainer() {
    return this.utils.createScrollableContainer();
  }

  createGlobalStyles() {
    return {
      reset: this.createGlobalResetStyle(),
      body: this.createBodyStyle(),
      scrollbar: this.createScrollbarStyles(),
      animations: this.createGlobalAnimationStyles()
    };
  }
}
