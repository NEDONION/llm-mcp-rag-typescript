import React from 'react';
import { List, Typography, Button, Modal, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Content } from '../ChatLLM';

const { Text } = Typography;

interface HistorySidebarProps {
  history: Content[][];
  setSelectedHistoryIndex: (index: number | null) => void;
  restoreChatContent: (content: Content[], index: number) => void;
  updateHistory: (history: Content[][]) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
                                                         history,
                                                         restoreChatContent,
                                                         updateHistory,
                                                       }) => {
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
      <div>
        <Text strong style={{ fontSize: 16, marginBottom: 12, display: 'block' }}>
          Chat History
        </Text>

        <List
            size="small"
            bordered={false}
            dataSource={history}
            renderItem={(conversation, index) => {
              const guestItem = conversation[0];
              if (!guestItem) return null;

              return (
                  <List.Item
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 0',
                        cursor: 'pointer',
                      }}
                      onClick={() => restoreChatContent(conversation, index)}
                  >
                      <Text ellipsis style={{ maxWidth: 180}}>
                          {guestItem.content.slice(0, 15)}
                      </Text>

                    <Tooltip title="Delete conversation">
                      <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(index);
                          }}
                      />
                    </Tooltip>
                  </List.Item>
              );
            }}
        />
      </div>
  );
};

export default HistorySidebar;
