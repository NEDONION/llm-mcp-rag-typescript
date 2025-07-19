import React, { useEffect, useState } from 'react';
import { Layout, Button, Modal, Form, Input, Table, Popconfirm, message } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../src/components/AdminLayout/AdminLayout.tsx';

const { Header, Content } = Layout;

interface KnowledgeItem {
    slug: string;
    category: string;
    title: string;
    language: string;
    content: string;
}

const AdminPage: React.FC = () => {
    const [list, setList] = useState<KnowledgeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const navigate = useNavigate();

    const fetchKnowledgeList = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/knowledge');
            setList(res.data.list);
        } catch (error) {
            message.error('Failed to fetch knowledge list');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug: string) => {
        try {
            await axios.delete(`/api/knowledge/${slug}`);
            message.success('Deleted successfully');
            fetchKnowledgeList();
        } catch {
            message.error('Failed to delete');
        }
    };

    const handleEdit = (item: KnowledgeItem) => {
        setEditingSlug(item.slug);
        form.setFieldsValue(item);
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingSlug(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await axios.post('/api/knowledge', values);
            message.success('Saved successfully');
            setModalVisible(false);
            fetchKnowledgeList();
        } catch {
            message.error('Save failed');
        }
    };

    useEffect(() => {
        fetchKnowledgeList();
    }, []);

    return (
        <AdminLayout>
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between' }}>
                    <h2>Knowledge Management</h2>
                    <div>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            style={{ marginRight: 12 }}
                            onClick={() => navigate('/')}
                        >
                            Back
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Add Knowledge
                        </Button>
                    </div>
                </Header>
                <Content style={{ margin: '24px 16px' }}>
                    <Table
                        rowKey="slug"
                        loading={loading}
                        dataSource={list}
                        columns={[
                            { title: 'Slug', dataIndex: 'slug' },
                            { title: 'Category', dataIndex: 'category' },
                            { title: 'Title', dataIndex: 'title' },
                            { title: 'Language', dataIndex: 'language' },
                            {
                                title: 'Actions',
                                render: (_, record) => (
                                    <>
                                        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
                                        <Popconfirm title="Confirm delete?" onConfirm={() => handleDelete(record.slug)}>
                                            <Button danger type="link" icon={<DeleteOutlined />}>Delete</Button>
                                        </Popconfirm>
                                    </>
                                )
                            },
                        ]}
                    />

                    <Modal
                        title={editingSlug ? 'Edit Knowledge' : 'Add Knowledge'}
                        open={modalVisible}
                        onCancel={() => setModalVisible(false)}
                        onOk={handleSubmit}
                    >
                        <Form layout="vertical" form={form}>
                            <Form.Item name="category" label="Category" rules={[{ required: true }]}> <Input /> </Form.Item>
                            <Form.Item name="title" label="Title" rules={[{ required: true }]}> <Input /> </Form.Item>
                            <Form.Item name="language" label="Language" rules={[{ required: true }]}> <Input /> </Form.Item>
                            <Form.Item name="content" label="Content" rules={[{ required: true }]}> <Input.TextArea rows={4} /> </Form.Item>
                        </Form>
                    </Modal>
                </Content>
            </Layout>
        </AdminLayout>
    );
};

export default AdminPage;
