// src/components/AdminLayout.tsx
import React from 'react';
import {Layout} from 'antd';
import AdminSidebar from '../../pages/AdminSidebar/AdminSidebar.tsx';

const { Sider, Content } = Layout;

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={220} style={{ background: 'transparent', borderRight: 'transparent' }}>
                <AdminSidebar />
            </Sider>
            <Layout>
                <Content style={{ padding: 24, background: 'transparent' }}>{children}</Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
