/**
 * Code styles unified management module
 * 
 * Unified management of all code-related styles:
 * - React component inline styles (code block container, fonts, spacing, etc.)
 * - CSS styles (syntax highlighting, comments, strings, etc.)
 * 
 * Benefits:
 * 1. Single responsibility: All code styles managed in one place
 * 2. Easy maintenance: Colors, fonts, etc. managed centrally
 * 3. Type safety: Full TypeScript type checking
 * 4. Theme support: Supports light/dark theme switching
 */

export interface CodeStyleConfig {
  codeColor: string;
  stringColor: string;
  commentColor: string;
  keywordColor: string;
  numberColor: string;
  fontSize: string;
  lineHeight: number;
}

export class CodeStyleManager {
  private static instance: CodeStyleManager;
  private config: CodeStyleConfig;

  constructor() {
    this.config = {
      codeColor: '#333333',
      stringColor: '#555555',
      commentColor: '#aaaaaa',
      keywordColor: '#d73a49',
      numberColor: '#005cc5',
      fontSize: '14px',
      lineHeight: 1.4
    };
  }

  public static getInstance(): CodeStyleManager {
    if (!CodeStyleManager.instance) {
      CodeStyleManager.instance = new CodeStyleManager();
    }
    return CodeStyleManager.instance;
  }

  getReactStyles(): { [key: string]: React.CSSProperties } {
    return {
      codeBlock: {
        position: 'relative' as const,
        backgroundColor: 'transparent',
        border: '1px solid #e1e4e8',
        borderRadius: '6px',
        padding: '0',
        overflow: 'hidden',
        marginBottom: '16px',
        fontFamily: '"SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", monospace',
        fontWeight: 'normal'
      },
      codeBlockHeader: {
        backgroundColor: '#e5e5e5',
        padding: '8px 16px',
        borderBottom: '1px solid #e1e4e8',
        fontSize: '12px',
        color: '#586069',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      },
      codeBlockContent: {
        color: this.config.codeColor,
        fontSize: this.config.fontSize,
        lineHeight: this.config.lineHeight,
        backgroundColor: 'transparent',
        padding: '16px',
        overflow: 'auto',
        maxHeight: '500px'
      },
      inlineCode: {
        color: this.config.codeColor,
        backgroundColor: '#f1f3f4',
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: this.config.fontSize,
        fontFamily: '"SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", monospace',
        fontWeight: 'normal'
      }
    };
  }

  getCSSStyles(): string {
    return `
/* Code style unified management - syntax highlighting styles */

pre, code {
  background: transparent !important;
}

pre code {
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
}

pre {
  scrollbar-width: thin;
  scrollbar-color: #cccccc transparent;
}

pre::-webkit-scrollbar {
  height: 4px !important;
  width: 8px !important;
}

pre::-webkit-scrollbar-track {
  background: transparent !important;
}

pre::-webkit-scrollbar-thumb {
  background-color: #cccccc !important;
  border-radius: 2px !important;
  border: none !important;
}

pre::-webkit-scrollbar-thumb:hover {
  background-color: #999999 !important;
}

pre::-webkit-scrollbar-button {
  display: none !important;
}

.hljs,
.hljs-comment,
.hljs-quote,
.hljs-string,
.hljs-keyword,
.hljs-number,
.hljs-literal,
.hljs-title,
.hljs-section {
  background: transparent !important;
  color: inherit !important;
}

.hljs-comment,
.hljs-quote {
  color: ${this.config.commentColor} !important;
  font-style: italic;
  font-weight: normal;
}

.hljs-string,
.hljs-meta .hljs-string {
  color: ${this.config.stringColor} !important;
  font-weight: normal !important;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-title,
.hljs-section {
  color: ${this.config.keywordColor} !important;
  font-weight: bold !important;
}

.hljs-number,
.hljs-literal {
  color: ${this.config.numberColor} !important;
  font-weight: bold !important;
}

pre code.hljs .hljs-comment {
  color: ${this.config.commentColor} !important;
  font-style: italic;
}

pre code.hljs .hljs-string {
  color: ${this.config.stringColor} !important;
  font-weight: normal !important;
}
`;
  }

  public updateConfig(newConfig: Partial<CodeStyleConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): CodeStyleConfig {
    return { ...this.config };
  }

  public applyToPage() {
    const styleId = 'code-styles-dynamic';
    const existingStyle = document.getElementById(styleId);
    
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = this.getCSSStyles();
    document.head.appendChild(style);
  }
}

export const codeStyleManager = CodeStyleManager.getInstance();
