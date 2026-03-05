/**
 * Chat domain styles
 * Contains styles for chat related components like chat input, message list, chat list, message bubbles, Markdown rendering, etc.
 */

import { ThemeConfig } from './theme';
import { StyleUtils } from './utils';
import { defaultTheme } from './theme';

export class ChatStyleGenerator {
  private utils: StyleUtils;

  constructor(theme: ThemeConfig = defaultTheme) {
    this.utils = new StyleUtils(theme);
  }

  createChatInputStyles() {
    return {
      container: {
        position: 'relative' as const,
        width: '100%',
        padding: `0 ${this.utils.spacing('lg')} ${this.utils.spacing('md')}`,
        boxSizing: 'border-box' as const,
      },
      wrapper: (maxWidth: string) => ({
        display: 'flex',
        alignItems: 'flex-end',
        maxWidth,
        margin: '0 auto',
        position: 'relative' as const,
        transition: 'max-width 0.3s ease-out'
      }),
      inner: {
        display: 'flex',
        alignItems: 'flex-start',
        backgroundColor: this.utils.getTheme().colors.background.paper,
        border: `1px solid ${this.utils.color('border')}`,
        borderRadius: '20px',
        padding: '16px',
        minHeight: '60px',
        flex: 1,
      },
      textFieldWrapper: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'flex-start',
        padding: '0',
        position: 'relative' as const,
        minHeight: '60px',
      },
      textField: {
        flex: 1,
        border: 'none',
        outline: 'none',
        resize: 'none' as const,
        fontSize: '14px',
        lineHeight: '1.4',
        minHeight: '28px',
        maxHeight: '120px',
        padding: '0 8px',
        margin: '0',
        backgroundColor: 'transparent',
        verticalAlign: 'baseline',
        alignSelf: 'flex-start',
        width: '100%',
        boxSizing: 'border-box' as const,
      },
      buttonContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        paddingLeft: this.utils.spacing('lg'),
        paddingTop: this.utils.spacing('lg'),
      },
      sendButton: (isSending: boolean, hasContent: boolean) => ({
        width: '32px',
        height: '32px',
        minWidth: '32px',
        minHeight: '32px',
        borderRadius: '50%',
        backgroundColor: hasContent ? this.utils.color('success') : this.utils.color('border'),
        color: hasContent ? this.utils.color('white') : this.utils.color('text.secondary'),
        border: 'none',
        cursor: hasContent && !isSending ? 'default' : 'not-allowed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s',
        position: 'absolute' as const,
        right: '8px',
        top: 'calc(100% - 42px)',
      }),
      stopButton: {
        width: '32px',
        height: '32px',
        minWidth: '32px',
        minHeight: '32px',
        borderRadius: '50%',
        backgroundColor: this.utils.color('success'),
        color: this.utils.color('white'),
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s',
        position: 'absolute' as const,
        right: '8px',
        top: 'calc(100% - 42px)',
      },
      icon: {
        width: '16px',
        height: '16px',
      }
    };
  }

  createNewChatButtonStyles() {
    return {
      base: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: this.utils.spacing('sm'),
        padding: `${this.utils.spacing('sm')} ${this.utils.spacing('md')}`,
        margin: this.utils.spacing('sm'),
        backgroundColor: this.utils.color('success'),
        color: this.utils.color('white'),
        border: 'none',
        borderRadius: this.utils.borderRadius('sm'),
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'default',
        transition: 'background-color 0.2s ease',
        width: 'calc(100% - 16px)',
        height: '36px',
        boxSizing: 'border-box' as const,
        ':hover': {
          backgroundColor: this.utils.color('successDark')
        }
      },
      disabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
      }
    };
  }

  createChatListStyles() {
    const scrollable = this.createScrollableContainer();
    
    return {
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        backgroundColor: this.utils.color('background.default')
      },
      
      newChatButtonContainer: {
        paddingTop: '12px',
        paddingLeft: this.utils.spacing('sm'),
        paddingRight: this.utils.spacing('sm'),
        paddingBottom: this.utils.spacing('sm')
      },
      
      newChatButton: {
        width: '100%',
        padding: `${this.utils.spacing('sm')} ${this.utils.spacing('md')}`,
        backgroundColor: this.utils.color('success'),
        color: this.utils.color('white'),
        border: 'none',
        borderRadius: this.utils.borderRadius('sm'),
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'default',
        transition: 'background-color 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: this.utils.spacing('xs')
      },
      
      chatList: scrollable.auto,
      
      chatItem: {
        padding: `${this.utils.spacing('sm')} ${this.utils.spacing('md')}`,
        borderBottom: `1px solid ${this.utils.color('background.default')}`,
        cursor: 'default',
        transition: 'background-color 0.2s ease'
      },
      
      chatItemHover: {
        backgroundColor: this.utils.color('hover')
      },
      
      chatItemContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      },
      
      chatTitle: {
        fontSize: '14px',
        fontWeight: 500,
        color: this.utils.color('text.primary'),
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const
      },
      
      chatTime: {
        fontSize: '12px',
        color: this.utils.color('text.secondary'),
        marginLeft: this.utils.spacing('sm')
      }
    };
  }

  createMessageListStyles() {
    const scrollable = this.createScrollableContainer();
    
    return {
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        overflow: 'hidden'
      },
      
      messageList: {
        ...scrollable.vertical,
        padding: this.utils.spacing('md'),
        display: 'flex',
        flexDirection: 'column' as const,
        gap: this.utils.spacing('sm')
      },
      
      messageItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        marginBottom: this.utils.spacing('md'),
        maxWidth: '70%'
      },
      
      userMessageItem: {
        alignSelf: 'flex-end' as const,
        alignItems: 'flex-end' as const
      },
      
      aiMessageItem: {
        alignSelf: 'flex-start' as const,
        alignItems: 'flex-start' as const
      },
      
      messageBubble: {
        padding: `${this.utils.spacing('sm')} ${this.utils.spacing('md')}`,
        borderRadius: '18px',
        wordBreak: 'break-word' as const,
        lineHeight: 1.4
      },
      
      userMessageBubble: {
        backgroundColor: this.utils.color('success'),
        color: this.utils.color('white')
      },
      
      aiMessageBubble: {
        backgroundColor: this.utils.color('background.default'),
        color: this.utils.color('text.primary')
      },
      
      messageTime: {
        fontSize: '11px',
        color: this.utils.color('text.secondary'),
        marginTop: this.utils.spacing('xs'),
        textAlign: 'center' as const
      }
    };
  }

  createMessageStyles() {
    return {
      container: {
        display: 'flex',
        marginBottom: this.utils.spacing('md'),
        gap: this.utils.spacing('sm'),
      },

      aiMessageContainer: {
        display: 'flex',
        marginBottom: this.utils.spacing('md'),
        gap: this.utils.spacing('sm'),
        justifyContent: 'flex-start',
        position: 'relative' as const,
      },

      userMessageContainer: {
        display: 'flex',
        marginBottom: this.utils.spacing('md'),
        gap: this.utils.spacing('sm'),
        justifyContent: 'flex-end',
        position: 'relative' as const,
      },
    };
  }

  createMessageBubbleStyles() {
    return {
      container: {
        maxWidth: '70%',
        borderRadius: '16px',
        padding: `${this.utils.spacing('sm')} ${this.utils.spacing('md')}`,
        wordBreak: 'break-word' as const,
        lineHeight: 1.4,
        animation: 'fadeIn 0.3s ease'
      },

      content: {
        fontSize: '18px'
      },

      user: {
        backgroundColor: this.utils.color('success'),
        color: this.utils.color('white')
      },

      ai: {
        backgroundColor: this.utils.color('white'),
        color: this.utils.color('text.primary')
      },

      reasoningContent: {
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e0e0e0',
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
        lineHeight: '1.5',
        fontSize: '13px',
        color: '#666',
        maxHeight: '400px',
        overflowY: 'auto' as const
      }
    };
  }

  createMessageActionsStyles() {
    return {
      button: {
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'default',
        transition: 'all 0.15s',
        color: this.utils.color('text.tertiary'),
        minWidth: '24px',
        minHeight: '24px'
      }
    };
  }

  createChatItemStyles() {
    return {
      mainContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: '0px',
        transition: 'background-color 0.2s ease, color 0.2s ease',
        cursor: 'default',
        minHeight: '48px'
      },
      activeContainer: {
        backgroundColor: this.utils.color('hover')
      },
      inactiveContainer: {
        backgroundColor: 'transparent',
        color: this.utils.color('text.primary')
      },
      hoverContainer: {
        backgroundColor: this.utils.color('hoverLight')
      },
      inputField: {
        flex: 1,
        backgroundColor: 'transparent',
        fontSize: '15px',
        fontWeight: 500,
        textAlign: 'left' as const,
        border: 'none',
        padding: '0px',
        outline: 'none',
        transition: 'background-color 0.2s ease',
        height: 'auto'
      },
      focusInputField: {
        borderColor: this.utils.color('borderFocus')
      },
      titleText: {
        flex: 1,
        fontSize: '15px',
        lineHeight: '1.4',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },
      contextMenu: {
        position: 'fixed' as const,
        backgroundColor: this.utils.color('white'),
        borderRadius: '6px',
        boxShadow: `0 10px 15px -3px ${this.utils.overlay('shadow')}, 0 4px 6px -2px ${this.utils.overlay('border')}`,
        border: '1px solid ' + this.utils.overlay('border'),
        zIndex: 50,
        padding: '0',
        minWidth: '120px',
        display: 'flex',
        flexDirection: 'column' as const
      },
      menuItem: {
        width: '100%',
        textAlign: 'left' as const,
        padding: '8px 16px',
        fontSize: '14px',
        color: this.utils.color('text.primary'),
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'default',
        transition: 'background-color 0.2s ease'
      },
      hoverMenuItem: {
        backgroundColor: this.utils.color('hover')
      },
      documentLinkedIndicator: {
        ...this.createDocumentLinkedIndicatorBase(),
        position: 'absolute' as const,
        top: '15px',
        right: '15px'
      }
    };
  }

  createMarkdownStyles() {
    return {
      container: {
        fontSize: '16px',
        lineHeight: 1.6,
        color: 'inherit',
        marginBottom: -8
      },
      
      h1: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginTop: this.utils.spacing('lg'),
        marginBottom: this.utils.spacing('md'),
        color: 'inherit'
      },
      h2: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginTop: this.utils.spacing('md'),
        marginBottom: this.utils.spacing('sm'),
        color: 'inherit'
      },
      h3: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginTop: this.utils.spacing('sm'),
        marginBottom: this.utils.spacing('xs'),
        color: 'inherit'
      },
      
      paragraph: {
        marginBottom: this.utils.spacing('sm'),
        color: 'inherit'
      },
      
      unorderedList: {
        marginBottom: this.utils.spacing('sm'),
        paddingLeft: this.utils.spacing('md'),
        color: 'inherit'
      },
      orderedList: {
        marginBottom: this.utils.spacing('sm'),
        paddingLeft: this.utils.spacing('md'),
        color: 'inherit'
      },
      listItem: {
        marginBottom: this.utils.spacing('xs'),
        color: 'inherit'
      },
      
      blockquote: {
        borderLeft: `4px solid ${this.utils.color('borderLightGray')}`,
        paddingLeft: this.utils.spacing('sm'),
        marginBottom: this.utils.spacing('sm'),
        fontStyle: 'italic',
        color: 'inherit'
      },
      
      table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        marginBottom: this.utils.spacing('sm'),
        color: 'inherit'
      },
      tableHeader: {
        backgroundColor: this.utils.color('background.default')
      },
      tableHeaderCell: {
        border: `1px solid ${this.utils.color('border')}`,
        padding: this.utils.spacing('xs'),
        fontWeight: 'bold',
        textAlign: 'left' as const,
        color: 'inherit'
      },
      tableBody: {},
      tableRow: {
        border: `1px solid ${this.utils.color('borderLightGray')}`
      },
      tableCell: {
        border: `1px solid ${this.utils.color('border')}`,
        padding: this.utils.spacing('xs'),
        color: 'inherit'
      },
      
      link: {
        color: '#333333',
        textDecoration: 'underline',
        cursor: 'pointer'
      },
      
      strong: {
        fontWeight: 'bold',
        color: 'inherit'
      },
      em: {
        fontStyle: 'italic',
        color: 'inherit'
      },
      del: {
        textDecoration: 'line-through',
        color: 'inherit'
      },
      
      horizontalRule: {
        border: 'none',
        height: '1px',
        backgroundColor: this.utils.color('border'),
        marginBottom: this.utils.spacing('sm')
      }
    };
  }

  createScrollableContainer() {
    return this.utils.createScrollableContainer();
  }

  createDocumentLinkedIndicatorBase() {
    return {
      display: 'flex',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      backgroundColor: '#22c55e',
      border: '2px solid white'
    };
  }

  createFadeInAnimation() {
    return `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `;
  }

  createMessageAttachmentCardStyles() {
    return {
      container: {
        display: 'flex',
        alignItems: 'center' as const,
        gap: '12px',
        padding: '10px 14px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        cursor: 'default',
        transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
        marginTop: '10px',
        maxWidth: '200px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
      },
      containerHovered: {
        backgroundColor: '#eeeeee',
        border: '1px solid #d1d5db',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)'
      },
      iconContainer: {
        display: 'flex',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        flexShrink: 0
      },
      infoContainer: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '3px'
      },
      title: {
        fontSize: '13px',
        fontWeight: 500,
        color: this.utils.color('text.primary'),
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const
      },
      metaInfo: {
        display: 'flex',
        alignItems: 'center' as const,
        gap: '6px',
        fontSize: '11px',
        color: this.utils.color('text.secondary')
      },
      typeLabel: {
        fontSize: '11px',
        fontWeight: 400
      },
      separator: {
        fontSize: '10px',
        color: '#d1d5db'
      },
      fileTypeLabel: {
        fontSize: '10px',
        fontWeight: 500,
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        padding: '2px 6px',
        borderRadius: '4px'
      },
      clickHint: {
        display: 'flex',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        color: '#9ca3af',
        opacity: 0,
        transition: 'opacity 0.2s ease'
      }
    };
  }
}
