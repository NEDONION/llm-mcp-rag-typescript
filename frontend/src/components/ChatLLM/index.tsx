import { useEffect, useState, useRef } from 'react';
import './index.css';
import { Layout } from 'antd';
import Guest from '../Guest';
import AIanswer from '../AIanswer';
import {fetchAIResponseOnce} from '../../api';
import { CheckOutlined, CopyOutlined, BarsOutlined } from '@ant-design/icons';
import HistorySidebar from '../Sidebar';
import ChatInput from '../ChatInput';
import { RedoOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import '../../icon/font/iconfont.css';

const { Sider, Content } = Layout;

export interface Content {
  content: string;
  type?: string;
  duration?: number; // Added duration to measure reply time (in ms)
  isCopied: boolean;
  image?: string;
  fileId?: string;
}

const ChatLLM = () => {
  const [guestContents, setGuestContents] = useState<Content[]>([]);
  const [aiContents, setAIContents] = useState<Content[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [combinedContents, setCombinedContents] = useState<Content[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [abortController, setAbortController] =
      useState<AbortController | null>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const [isUploading] = useState(false);
  const [messageType, setMessageType] = useState('text');
  const fileId = useRef<string | null>(null);
  // 修改 history 类型为二维数组
  const [history, setHistory] = useState<Content[][]>(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      // 兼容旧数据结构（一维数组转二维）
      return Array.isArray(parsed[0]) ? parsed : [parsed];
    }
    return [];
  });

  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<
      number | null
  >(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false); // 新增状态管理侧边栏折叠
  const [isFloating, setIsFloating] = useState(false); // 新增状态管理侧边栏悬浮

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setIsResponding(false);
    }
  };

  const onSearch = async (value: string) => {
    if (!value.trim() && !previewImage) return;

    setGuestContents((prevContents) => [
      ...prevContents,
      {
        content: value,
        isCopied: false,
        image: previewImage || undefined,
      },
    ]);
    setSearchValue('');
    setPreviewImage(null);

    let aiContent = '';
    setAIContents((prevContents) => [
      ...prevContents,
      { content: aiContent, isCopied: false },
    ]);

    const controller = new AbortController();
    setAbortController(controller);
    setIsResponding(true);
    const startTime = Date.now();


    let objectString = '';
    if (fileId.current) {
      objectString = JSON.stringify([
        { type: 'text', text: value },
        { type: messageType, fileId: fileId.current },
      ]);
    }
    const requestValue = fileId.current ? objectString : value;

    try {
      await fetchAIResponseOnce(
          requestValue,
          [],
          (data: string) => {
            aiContent += data;
            setAIContents((prevContents) => {
              const newContents = [...prevContents];
              newContents[newContents.length - 1].content = aiContent;
              return newContents;
            });
          },
          messageType,
          controller.signal
      );
    } finally {
      setIsResponding(false);
      setAbortController(null);
      const answerDuration = Date.now() - startTime;
      setAIContents((prevContents) => {
        const newContents = [...prevContents];
        if (newContents.length > 0) {
          newContents[newContents.length - 1] = {
            ...newContents[newContents.length - 1],
            duration: answerDuration,
            isCopied: false,
          };
        }
        return newContents;
      });
    }

    const textarea = document.querySelector(
        '.chat-input-search'
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, (15 * window.innerHeight) / 100)}px`;
    }
    fileId.current = null;
    setMessageType('text');
  };

  const onRetry = async (combinedIndex: number) => {
    const conversationIndex = Math.floor(combinedIndex / 2);
    if (!guestContents[conversationIndex]) return;

    const contentToRetry = guestContents[conversationIndex].content;
    let aiContent = '';

    setAIContents((prevContents) => {
      const newContents = [...prevContents];
      if (newContents[conversationIndex]) {
        newContents[conversationIndex] = {
          ...newContents[conversationIndex],
          content: '',
        };
      }
      return newContents;
    });

    const controller = new AbortController();
    setAbortController(controller);
    setIsResponding(true);
    const startTime = Date.now();

    try {
      await fetchAIResponseOnce(
          contentToRetry,
          [],
          (data: string) => {
            aiContent += data;
            setAIContents((prevContents) => {
              const newContents = [...prevContents];
              if (newContents[conversationIndex]) {
                newContents[conversationIndex] = {
                  ...newContents[conversationIndex],
                  content: aiContent,
                };
              }
              return newContents;
            });
          },
          'text',
          controller.signal
      );
    } finally {
      setIsResponding(false);
      setAbortController(null);
      const answerDuration = Date.now() - startTime;
      setAIContents((prevContents) => {
        const newContents = [...prevContents];
        if (newContents.length > conversationIndex) {
          newContents[conversationIndex] = {
            ...newContents[conversationIndex],
            duration: answerDuration,
            isCopied: false,
          };
        }
        return newContents;
      });
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    const input = document.getElementById('file-input') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
    setMessageType('text');
  };

  useEffect(() => {
    const combined: Content[] = [];
    for (
        let i = 0;
        i < Math.max(guestContents.length, aiContents.length);
        i++
    ) {
      if (guestContents[i]) {
        combined.push({ ...guestContents[i], type: 'guest' });
      }
      if (aiContents[i])
        combined.push({ ...aiContents[i], type: 'ai', isCopied: false });
    }
    console.log(combined);
    setCombinedContents(combined);
  }, [guestContents, aiContents]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [combinedContents]);
  // 改造后的历史同步逻辑，将当前对话实时自动保存到 History 中
  useEffect(() => {
    if (combinedContents.length === 0) return; // 对话为空时不进行更新

    setHistory((prevHistory) => {
      if (selectedHistoryIndex !== null) {
        // 对话已存在于历史中，更新该历史项
        const newHistory = [...prevHistory];
        // 在保存到 localStorage 之前移除图片数据
        const historyToSave = combinedContents.map((content) => ({
          ...content,
          image: content.image ? '[图片]' : undefined, // 将图片数据替换为标记
        }));
        newHistory[selectedHistoryIndex] = historyToSave;
        try {
          localStorage.setItem('chatHistory', JSON.stringify(newHistory));
        } catch (e) {
          console.warn('Failed to save chat history to localStorage:', e);
        }
        return newHistory;
      } else {
        // 当前对话为新对话，直接添加到历史中
        const historyToSave = combinedContents.map((content) => ({
          ...content,
          image: content.image ? '[图片]' : undefined,
        }));
        const newHistory = [...prevHistory, historyToSave];
        try {
          localStorage.setItem('chatHistory', JSON.stringify(newHistory));
        } catch (e) {
          console.warn('Failed to save chat history to localStorage:', e);
        }
        // 将新添加的对话标记为当前对话，后续变更会覆盖这个历史项
        setSelectedHistoryIndex(newHistory.length - 1);
        return newHistory;
      }
    });
  }, [combinedContents, selectedHistoryIndex]);

  const restoreChatContent = (restoredContent: Content[], index: number) => {
    setGuestContents(restoredContent.filter((item) => item.type === 'guest'));
    setAIContents(restoredContent.filter((item) => item.type === 'ai'));
    setSelectedHistoryIndex(index); // 标记当前正在编辑的对话
  };

  const handleCopy = (index: number, content: string) => {
    // 过滤掉建议部分，只复制实际内容，抽象的做法（扶额）
    const textContent = content.split(/\{"type":"suggestions".*?\}/)[0];
    navigator.clipboard
        .writeText(textContent)
        .then(() => {
          setCombinedContents((prevContents) => {
            const newContents = [...prevContents];
            newContents[index] = { ...newContents[index], isCopied: true };
            return newContents;
          });
          setTimeout(() => {
            setCombinedContents((prevContents) => {
              const newContents = [...prevContents];
              newContents[index] = { ...newContents[index], isCopied: false };
              return newContents;
            });
          }, 5000);
        })
        .catch((err) => {
          console.error('Copy failed:', err);
        });
  };

  const updateHistory = (updatedHistory: Content[][]) => {
    setHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory)); // 更新本地存储
  };
  const saveCurrentConversation = () => {
    // 注释或调整此判断以允许保存空对话
    // if (combinedContents.length === 0) return;

    setHistory((prev) => {
      const newHistory =
          selectedHistoryIndex !== null
              ? prev.map((conv, i) =>
                  i === selectedHistoryIndex ? combinedContents : conv
              )
              : [...prev, combinedContents];

      localStorage.setItem('chatHistory', JSON.stringify(newHistory));
      return newHistory;
    });

    // 重置对话状态
    setGuestContents([]);
    setAIContents([]);
    setCombinedContents([]);
    setSelectedHistoryIndex(null);
  };

  const onNewConversation = () => {
    // 保存当前对话到历史记录
    saveCurrentConversation();
    // 清空输入框和相关状态以开始新对话
    setSearchValue('');
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight < window.innerWidth) {
        setCollapsed(false);
      } else {
        setCollapsed(true);
        setIsFloating(false); // 取消悬浮状态
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化时检查窗口大小

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
    setIsFloating(!isFloating); // 切换悬浮状态
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('.sidebar-container');
      if (isFloating && sidebar && !sidebar.contains(event.target as Node)) {
        setCollapsed(true);
        setIsFloating(false); // 取消悬浮状态
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFloating]);

  return (
      <Layout style={{ height: '100vh' }}>
        {!collapsed && ( // 仅在未折叠时渲染 Sider
            <Sider
                width={300}
                style={{
                  background: '#212121',
                  position: isFloating ? 'fixed' : 'relative',
                  left: isFloating ? 0 : 'auto',
                  top: 0,
                  height: '100vh',
                  zIndex: isFloating ? 1000 : 'auto',
                  transition: 'width 0.3s',
                }}
            >
              <div
                  className="sidebar-header"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
              >
                <h2 style={{ color: '#fff', fontSize: '20px', marginLeft: '30px' }}>
                  LLM-MCP-RAG BOT
                </h2>
                <BarsOutlined
                    onClick={handleToggleSidebar}
                    style={{
                      cursor: 'pointer',
                      fontSize: '25px',
                      color: '#fff',
                      marginLeft: '25px',
                    }}
                />
              </div>
              <div className="sidebar-container">
                <HistorySidebar
                    history={history}
                    setSelectedHistoryIndex={setSelectedHistoryIndex}
                    restoreChatContent={restoreChatContent}
                    updateHistory={updateHistory}
                />
              </div>
            </Sider>
        )}
        {collapsed && ( // 新增悬浮的 BarsOutlined 图标
            <BarsOutlined
                onClick={handleToggleSidebar}
                style={{
                  position: 'fixed',
                  top: '20px',
                  left: '20px',
                  fontSize: '25px',
                  color: '#fff',
                  zIndex: 1000,
                  cursor: 'pointer',
                }}
            />
        )}
        <Layout>
          <Content>
            <div className="chat-body">
              <div className="chat-main">
                <div className="chat-content" ref={chatContentRef}>
                  {combinedContents.map((content, index) => {
                    if (content.type === 'guest') {
                      return (
                          <div key={index} className="guest-message">
                            <Guest content={content.content} />
                            {content.image && (
                                <div className="guest-image-container">
                                  <img
                                      src={content.image}
                                      alt="uploaded"
                                      className="guest-uploaded-image"
                                  />
                                </div>
                            )}
                          </div>
                      );
                    } else {
                      return (
                          <div key={index}>
                            <AIanswer
                                content={content.content}
                                duration={content.duration}
                                onSuggestClick={(suggestion) => onSearch(suggestion)}
                            />
                            {content.duration !== undefined && (
                                <div
                                    className="chat-ai-footer"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      marginTop: '8px',
                                      marginLeft: '30px',
                                      marginRight: '15px',
                                    }}
                                >
                                  <Tooltip title="重新回答">
                                    <RedoOutlined
                                        onClick={() => onRetry(index)}
                                        style={{
                                          fontSize: '16px',
                                          cursor: 'pointer',
                                          marginRight: '8px',
                                        }}
                                    />
                                  </Tooltip>
                                  <CheckOutlined />
                                  <span
                                      style={{ marginLeft: '4px', marginRight: '16px' }}
                                  >
                              {(content.duration / 1000).toFixed(2)}s
                            </span>
                                  <CopyOutlined
                                      onClick={() => handleCopy(index, content.content)}
                                      style={{ cursor: 'pointer' }}
                                  />
                                  <span style={{ marginLeft: '8px' }}>
                              {content.isCopied ? '已复制' : ''}
                            </span>
                                </div>
                            )}
                          </div>
                      );
                    }
                  })}
                </div>
                <ChatInput
                    searchValue={searchValue}
                    previewImage={previewImage}
                    isUploading={isUploading}
                    isResponding={isResponding}
                    onSearchValueChange={(value) => {
                      setSearchValue(value);
                    }}
                    onSearch={onSearch}
                    onNewConversation={onNewConversation}
                    clearImage={clearImage}
                    handleStop={handleStop}
                    onSubmitPicture={function (): void {
                      throw new Error('Function not implemented.');
                    }}                />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
  );
};

export default ChatLLM;
