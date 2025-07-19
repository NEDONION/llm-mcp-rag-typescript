import React from 'react';
import './index.css';
import { DeleteOutlined } from '@ant-design/icons';

import { Content } from '../ChatLLM';
import {Modal} from "antd";

interface HistorySidebarProps {
  history: Content[][];
  setSelectedHistoryIndex: (index: number | null) => void;
  restoreChatContent: (content: Content[], index: number) => void;
  updateHistory: (history: Content[][]) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history,  restoreChatContent, updateHistory }) => {
  const handleDelete = (index: number) => {
    Modal.confirm({
      title: 'Delete this conversation?',
      content: 'Are you sure you want to delete this conversation record? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        const updatedHistory = history.filter((_, idx) => idx !== index);
        updateHistory(updatedHistory);
      },
    });
  };

  return (
    <div className="sidebar-container">
      <h3 className='sidebar-h'>Chat History</h3>

      {history.map((conversation, index) => {
        // 假设每个对话数组中第一条消息为 guest 消息
        const guestItem = conversation[0];
        if (!guestItem) return null;

        return (
          <div key={index} className="history-item" onClick={() => restoreChatContent(conversation, index)}>
            <span className="user-input" title={guestItem.content}>
              {guestItem.content.slice(0, 15)}
            </span>
            <span onClick={(e) => { e.stopPropagation(); handleDelete(index); }} className="icon" >
              <DeleteOutlined />
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default HistorySidebar;