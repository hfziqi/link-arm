/**
 * Knowledge base domain styles
 * Contains styles for knowledge base related components like document items, property dialogs, etc.
 */

export class KnowledgeBaseStyleGenerator {
  constructor() {
  }

  createDocumentItemStyles() {
    return {
      container: {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center',
        width: '100%',
        minWidth: '60px',
        maxWidth: '80px',
        gap: '4px',
        cursor: 'default' as const
      },
      containerHovered: {
        backgroundColor: '#e0e0e0',
        borderRadius: '6px'
      },
      iconContainer: {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '50px',
        marginTop: '8px'
      },
      selectedIndicator: {
        position: 'absolute' as const,
        top: '-6px',
        right: '-6px',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: '#22c55e',
        border: '2px solid white',
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      },
      cardInputField: {
        fontSize: '13px',
        fontWeight: 500,
        textAlign: 'center' as const,
        width: '100%',
        border: '1px solid #a0a0a0',
        borderRadius: '4px',
        padding: '3px 6px',
        outline: 'none'
      },
      cardTitleText: {
        fontSize: '11px',
        fontWeight: 500,
        color: '#757575',
        textAlign: 'center' as const,
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    };
  }

}
