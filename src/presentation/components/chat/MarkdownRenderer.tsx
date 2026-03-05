import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { codeStyleManager } from '../../styles/CodeStyles';
import { componentStyles } from '../../styles';

export interface MarkdownRendererProps {
  content: string;
  style?: React.CSSProperties;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  style 
}) => {
  const generalStyles = componentStyles.createMarkdownStyles();
  const codeStyles = codeStyleManager.getReactStyles();

  return (
    <div style={{ ...generalStyles.container, ...style }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 style={generalStyles.h1}>{children}</h1>,
          h2: ({ children }) => <h2 style={generalStyles.h2}>{children}</h2>,
          h3: ({ children }) => <h3 style={generalStyles.h3}>{children}</h3>,
          p: ({ children }) => <p style={generalStyles.paragraph}>{children}</p>,
          ul: ({ children }) => <ul style={generalStyles.unorderedList}>{children}</ul>,
          ol: ({ children }) => <ol style={generalStyles.orderedList}>{children}</ol>,
          li: ({ children }) => <li style={generalStyles.listItem}>{children}</li>,
          code: ({ className, children, ...props }) => {
            return (
              <code 
                style={codeStyles.inlineCode} 
                className={className} 
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children, className }) => {
            const language = className ? 
              className.replace(/^(language-|hljs)/, '').replace('hljs', '').trim() : 
              'text';
            
            const displayLanguage = language || 'text';
            
            return (
              <div style={codeStyles.codeBlock}>
                <div style={codeStyles.codeBlockHeader}>
                  {displayLanguage}
                </div>
                <pre style={codeStyles.codeBlockContent} className={className}>
                  {children}
                </pre>
              </div>
            );
          },
          blockquote: ({ children }) => <blockquote style={generalStyles.blockquote}>{children}</blockquote>,
          table: ({ children }) => <table style={generalStyles.table}>{children}</table>,
          thead: ({ children }) => <thead style={generalStyles.tableHeader}>{children}</thead>,
          tbody: ({ children }) => <tbody style={generalStyles.tableBody}>{children}</tbody>,
          tr: ({ children }) => <tr style={generalStyles.tableRow}>{children}</tr>,
          th: ({ children }) => <th style={generalStyles.tableHeaderCell}>{children}</th>,
          td: ({ children }) => <td style={generalStyles.tableCell}>{children}</td>,
          a: ({ children, href }) => <a style={generalStyles.link} href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
          strong: ({ children }) => <strong style={generalStyles.strong}>{children}</strong>,
          em: ({ children }) => <em style={generalStyles.em}>{children}</em>,
          del: ({ children }) => <del style={generalStyles.del}>{children}</del>,
          hr: () => <hr style={generalStyles.horizontalRule} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
