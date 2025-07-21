import React from 'react';
import { Menu } from 'antd';
import {
    HomeOutlined,
    DatabaseOutlined,
    FileSearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const AdminSidebar: React.FC = () => {
    const navigate = useNavigate();

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    return (
        <div style={{ width: 200, height: '100vh', borderRight: '1px solid #f0f0f0', paddingTop: 24}}>
            <Menu
                mode="inline"
                defaultSelectedKeys={[window.location.pathname]}
                style={{ height: '100%', borderRight: 0 }}
                onClick={handleMenuClick}
                items={[
                    {
                        key: '/',
                        icon: <HomeOutlined />,
                        label: 'Return Home',
                    },
                    {
                        key: '/admin',
                        icon: <DatabaseOutlined />,
                        label: 'Knowledge Admin',
                    },
                    {
                        key: '/admin/rag',
                        icon: <FileSearchOutlined />,
                        label: 'RAG Admin',
                    },
                ]}
            />
        </div>
    );
};

export default AdminSidebar;
