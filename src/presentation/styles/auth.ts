/**
 * Form styles
 * Contains styles for common form components
 */

import { ThemeConfig } from './theme';
import { StyleUtils } from './utils';
import { defaultTheme } from './theme';

export class AuthStyleGenerator {
  private utils: StyleUtils;

  constructor(theme: ThemeConfig = defaultTheme) {
    this.utils = new StyleUtils(theme);
  }

  /**
   * General form styles
   * Used for add model forms, etc.
   */
  createFormStyles() {
    return {
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '30px',
        padding: `${this.utils.spacing('md')} ${this.utils.spacing('md')} ${this.utils.spacing('lg')}`
      },
      formGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: this.utils.spacing('xs')
      },
      inputContainer: {
        display: 'flex',
        flexDirection: 'row' as const,
        alignItems: 'center',
        position: 'relative' as const,
        border: `1px solid ${this.utils.color('borderMedium')}`,
        borderRadius: '6px',
        backgroundColor: this.utils.color('white'),
        overflow: 'hidden'
      },
      prefixContainer: {
        display: 'flex',
        alignItems: 'center',
        position: 'relative' as const
      },
      prefixText: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        fontSize: '14px',
        color: this.utils.color('text.secondary'),
        position: 'relative' as const
      },
      divider: {
        position: 'absolute' as const,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        height: '20px',
        width: '1px',
        backgroundColor: this.utils.color('borderMedium'),
        zIndex: 1
      },
      input: {
        flex: 1,
        border: 'none',
        borderRadius: 0,
        padding: '8px 12px',
        outline: 'none',
        fontSize: '14px',
        backgroundColor: 'transparent',
        color: this.utils.color('text.primary')
      },
      errorText: {
        color: this.utils.color('error'),
        fontSize: '12px',
        marginTop: '4px',
        marginLeft: '12px'
      },
      buttonContainer: {
        display: 'flex',
        alignItems: 'center',
        position: 'relative' as const
      },
      getCodeButton: {
        border: 'none',
        borderRadius: 0,
        padding: '8px 12px',
        backgroundColor: this.utils.color('white'),
        color: this.utils.color('text.secondary'),
        fontSize: '13px',
        fontWeight: '400',
        whiteSpace: 'nowrap' as const,
        minWidth: '52px',
        width: '52px',
        textAlign: 'center' as const,
        height: '36px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      getCodeButtonDisabled: {
        color: this.utils.color('text.secondary'),
        cursor: 'not-allowed'
      },
      buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
        gap: this.utils.spacing('md'),
        paddingTop: this.utils.spacing('md')
      },
      button: {
        minWidth: '120px',
        width: '120px'
      }
    };
  }

  createUserSettingsStyles() {
    return {
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: this.utils.spacing('lg'),
      },
      userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: this.utils.spacing('md'),
        padding: '20px 20px 20px 30px'
      },
      avatar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: this.utils.color('border')
      },
      userDetails: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: this.utils.spacing('xs')
      },
      title: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 500,
        color: this.utils.color('text.primary')
      },
      subtitle: {
        margin: 0,
        fontSize: '14px',
        color: this.utils.color('text.secondary')
      },
      actions: {
        display: 'flex',
        justifyContent: 'center',
        gap: this.utils.spacing('md'),
        paddingTop: '48px'
      },
      cancelButton: {
        minWidth: '120px',
        width: '120px'
      },
      logoutButton: {
        minWidth: '120px',
        width: '120px'
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
      getCodeButton: {
        padding: '8px 12px',
        backgroundColor: this.utils.color('white'),
        color: this.utils.color('text.secondary'),
        fontSize: '13px',
        fontWeight: '400',
        whiteSpace: 'nowrap' as const,
        minWidth: '52px',
        width: '52px',
        textAlign: 'center' as const,
        height: '36px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      getCodeButtonDisabled: {
        color: this.utils.color('text.secondary')
      },
      input: {
        flex: 1,
        border: 'none',
        borderRadius: 0,
        padding: '8px 12px',
        outline: 'none',
        fontSize: '14px',
        backgroundColor: 'transparent',
        color: this.utils.color('text.primary')
      },
      divider: {
        position: 'absolute' as const,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        height: '20px',
        width: '1px',
        backgroundColor: this.utils.color('borderMedium'),
        zIndex: 1
      },
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
        color: this.utils.color('error'),
        fontSize: '12px',
        marginTop: '4px',
        marginLeft: '12px'
      }
    };
  }
}
