import React from 'react';
import { Button } from 'antd';
import {
    ArrowUpOutlined,
    MessageOutlined,
    PictureOutlined,
    CloseOutlined,
    StopOutlined,
} from '@ant-design/icons';
import './index.css';

interface ChatInputProps {
    searchValue: string;
    previewImage: string | null;
    isUploading: boolean;
    isResponding: boolean;
    onSearchValueChange: (value: string) => void;
    onSearch: (value: string) => void;
    onNewConversation: () => void;
    onSubmitPicture: (event: React.ChangeEvent<HTMLInputElement>) => void;
    clearImage: () => void;
    handleStop: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
                                                 searchValue,
                                                 previewImage,
                                                 isUploading,
                                                 isResponding,
                                                 onSearchValueChange,
                                                 onSearch,
                                                 onNewConversation,
                                                 onSubmitPicture,
                                                 clearImage,
                                                 handleStop,
                                             }) => {
    return (
        <div className="chat-input">
            {previewImage && (
                <div className="image-preview">
                    <img
                        src={previewImage}
                        alt="preview"
                        style={{
                            opacity: isUploading ? 0.6 : 1,
                            maxWidth: '100px',
                            maxHeight: '100px',
                            objectFit: 'contain',
                        }}
                    />
                    {isUploading && (
                        <div className="upload-loading">
                            <div className="loading-spinner"></div>
                        </div>
                    )}
                    <Button
                        icon={<CloseOutlined />}
                        size="small"
                        onClick={clearImage}
                        className="clear-image"
                    />
                </div>
            )}
            <textarea
                className="chat-input-search"
                placeholder="input search text"
                value={searchValue}
                onChange={(e) => {
                    onSearchValueChange(e.target.value);
                    const textarea = e.target;
                    textarea.style.height = 'auto';
                    textarea.style.height = `${Math.min(textarea.scrollHeight, (15 * window.innerHeight) / 100)}px`;
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onSearch(searchValue);
                    }
                }}
                rows={3}
            />
            <div className="chat-input-button">
                <div>
                    <Button
                        onClick={onNewConversation}
                        className="new-conversation-button"
                    >
                        <MessageOutlined />
                    </Button>
                </div>
                <div className="chat-input-button-right">
                    <Button
                        onClick={() => document.getElementById('file-input')?.click()}
                        className="file-input-button"
                    >
                        <PictureOutlined />
                    </Button>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onSubmitPicture}
                        style={{ display: 'none' }}
                        id="file-input"
                    />
                    {isResponding ? (
                        <Button onClick={handleStop} className="stop-button">
                            <StopOutlined />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onSearch(searchValue)}
                            className="search-button"
                        >
                            <ArrowUpOutlined />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
