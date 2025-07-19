import React, { useState } from 'react';
import hljs from '../../utils/highlightConfig';
import './index.css';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copyMessage, setCopyMessage] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopyMessage('已复制');
    setTimeout(() => setCopyMessage('Copy'), 5000); // 2秒后恢复为"Copy"
  };

  const highlighted = language
    ? hljs.highlight(value, { language: language || 'plaintext' }).value
    : value;

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={handleCopy} className="copy-button">
        {copyMessage || 'Copy'}
      </button>
      <pre className="code-pre">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
};

export default CodeBlock;
