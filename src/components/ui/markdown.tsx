'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className = '' }: MarkdownProps) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
        components={{
          // Add custom styling for elements
          h1: (props) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: (props) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: (props) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          a: (props) => <a className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />,
          
          // Code blocks with syntax highlighting
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            return className ? (
              <div className="my-2">
                <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-3 overflow-x-auto text-xs">
                  <code className={className} data-language={language} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            );
          },
          
          // Tables
          table: (props) => <div className="my-3 overflow-x-auto"><table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 text-xs" {...props} /></div>,
          thead: (props) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
          tbody: (props) => <tbody className="divide-y divide-gray-200 dark:divide-gray-800" {...props} />,
          tr: (props) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-900" {...props} />,
          th: (props) => <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" {...props} />,
          td: (props) => <td className="px-2 py-1.5 text-xs" {...props} />,
          
          // Lists
          ul: (props) => <ul className="list-disc pl-5 space-y-0.5 my-2 text-sm" {...props} />,
          ol: (props) => <ol className="list-decimal pl-5 space-y-0.5 my-2 text-sm" {...props} />,
          li: (props) => <li className="my-0.5" {...props} />,
          
          // Blockquotes
          blockquote: (props) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-3 py-1 my-2 text-gray-700 dark:text-gray-300 italic text-sm" {...props} />,
          
          // Basic styling
          p: (props) => <p className="mb-2 last:mb-0" {...props} />,
          em: (props) => <em className="italic" {...props} />,
          strong: (props) => <strong className="font-bold" {...props} />,
          hr: (props) => <hr className="my-4 border-t border-gray-300 dark:border-gray-700" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 