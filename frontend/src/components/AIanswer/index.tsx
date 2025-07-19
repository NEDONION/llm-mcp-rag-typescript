import React from 'react';
import './index.css';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

interface AIanswerProps {
  content: string;
  duration?: number;
  onSuggestClick?: (suggestion: string) => void;
}
interface CodeProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}
// TODO： 有组件多次重复渲染的问题，需要优化
const AIanswer = (props: AIanswerProps) => {
  const { content, onSuggestClick } = props;
  const [answer, setAnswer] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  React.useEffect(() => {
    const suggestionMatch = content.match(/\{"type":"suggestions".*?\}/g);
    if (suggestionMatch) {
      try {
        const lastSuggestion = suggestionMatch[suggestionMatch.length - 1];
        const parsed = JSON.parse(lastSuggestion);
        setSuggestions(parsed.suggestions);

        // 提取非建议部分的文本
        const textContent = content.split(/\{"type":"suggestions".*?\}/)[0];
        if (textContent) {
          setAnswer(textContent);
        }
      } catch (e) {
        console.log('解析建议失败:', e);
      }
    } else {
      // 如果没有建议，直接设置文本内容
      setAnswer(content);
    }
  }, [content]);

  return (
    <div className="chat-ai">
      <div className="chat-ai-avator">
        <i className="iconfont icon-gpt" style={{ fontSize: '24px' }}></i>
      </div>
      <div className="chat-ai-answer-content">
        <div className="chat-ai-answer">
          <ReactMarkdown
            components={{
              code: ({ inline, className, children }: CodeProps) => {
                if (inline) {
                  return (
                    <code
                      className="chat-code"
                      style={{
                        backgroundColor: 'var(--secondary-bg)',
                        padding: '0.2em 0.4em',
                        borderRadius: '3px',
                        fontSize: '85%',
                        color: 'var(--text-color)',
                      }}
                    >
                      {children}
                    </code>
                  );
                }
                const language = className
                  ? className.replace('language-', '')
                  : '';
                return (
                  <CodeBlock
                    language={language}
                    value={String(children).replace(/\n$/, '')}
                  />
                );
              },
            }}
          >
            {answer}
          </ReactMarkdown>
        </div>

        <div className="chat-ai-answer-suggestions">
          {suggestions.length > 0 && (
            <div className="chat-ai-answer-suggestion-box">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => onSuggestClick?.(suggestion)}
                  className="chat-ai-answer-suggestion-item"
                  // 用hover效果
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 8px var(--shadow-color)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIanswer;
