import React, {useEffect, useState} from 'react';
import {
    Layout,
    Button,
    Modal,
    Input,
    Table,
    Popconfirm,
    message,
    Tooltip, Space,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    CheckCircleTwoTone,
    CloseCircleTwoTone,
    CloudUploadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import AdminLayout from '../../../src/components/AdminLayout/AdminLayout.tsx';

const {Header, Content} = Layout;

interface KnowledgeItem {
    slug: string;
    category: string;
    title: string;
    language: string;
    content: string;
    embedded?: boolean;
}

const AdminPage: React.FC = () => {
    const [list, setList] = useState<KnowledgeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [formState, setFormState] = useState({
        category: '',
        title: '',
        language: '',
        content: '',
    });

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
        setFormState({
            category: item.category,
            title: item.title,
            language: item.language,
            content: item.content,
        });
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingSlug(null);
        setFormState({category: '', title: '', language: '', content: ''});
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const payload: any = {...formState};
            if (editingSlug) payload.slug = editingSlug;
            console.log('Submitting:', payload);
            await axios.post('/api/knowledge', payload);
            message.success('Saved successfully');
            setModalVisible(false);
            fetchKnowledgeList();
        } catch {
            message.error('Save failed');
        }
    };

    const handleEmbed = async (slug: string) => {
        try {
            setLoading(true);
            const res = await axios.post('/api/rag/embed', {slug});
            const data = res.data.data;

            Modal.info({
                title: 'Embedding Result',
                width: 700,
                content: (
                    <div style={{maxHeight: 400, overflowY: 'auto', whiteSpace: 'pre-wrap'}}>
                        <p><strong>Slug:</strong> {data.slug}</p>
                        <p><strong>Category:</strong> {data.category}</p>
                        <p><strong>Content:</strong> {data.content}</p>
                        <p><strong>Model:</strong> {data.model}</p>
                        <p><strong>Vector Preview:</strong> {data.preview}</p>
                    </div>
                ),
            });

            fetchKnowledgeList();
        } catch {
            message.error('Embedding failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKnowledgeList();
    }, []);

    return (

        <AdminLayout>
            <Layout>
                <Header
                    style={{background: 'transparent', padding: '0 24px', display: 'flex', justifyContent: 'space-between'}}>
                    <h2>Knowledge Management</h2>
                    <div>
                        <Space>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate('/')}
                            >
                                Back
                            </Button>

                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={handleAdd}
                            >
                                Add Knowledge
                            </Button>
                        </Space>
                    </div>
                </Header>
                <Content style={{margin: '24px 16px'}}>
                    <Table
                        rowKey="slug"
                        loading={loading}
                        dataSource={list}
                        columns={[
                            {title: 'Slug', dataIndex: 'slug'},
                            {title: 'Category', dataIndex: 'category'},
                            {title: 'Title', dataIndex: 'title'},
                            {title: 'Language', dataIndex: 'language'},
                            {
                                title: 'Embedding Status',
                                dataIndex: 'embedded',
                                render: (embedded: boolean) =>
                                    embedded ? (
                                        <span style={{color: 'green'}}>
                      <CheckCircleTwoTone twoToneColor="#52c41a" style={{marginRight: 4}}/>
                      Embedded
                    </span>
                                    ) : (
                                        <span style={{color: 'red'}}>
                      <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{marginRight: 4}}/>
                      Not embedded
                    </span>
                                    ),
                            },
                            {
                                title: 'Actions',
                                render: (_, record) => (
                                    <div key={record.slug}>
                                        <Tooltip title={record.embedded ? 'Already embedded' : 'Embed'}>
                                            <Button
                                                type="primary"
                                                icon={<CloudUploadOutlined/>}
                                                size="small"
                                                onClick={() => handleEmbed(record.slug)}
                                                disabled={record.embedded}
                                                style={{marginRight: 8}}
                                            >
                                                Embed
                                            </Button>
                                        </Tooltip>
                                        <Button type="link" icon={<EditOutlined/>} onClick={() => handleEdit(record)}>
                                            Edit
                                        </Button>
                                        <Popconfirm title="Confirm delete?" onConfirm={() => handleDelete(record.slug)}>
                                            <Button danger type="link" icon={<DeleteOutlined/>}>
                                                Delete
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                ),
                            },
                        ]}
                    />

                    <Modal
                        title={editingSlug ? 'Edit Knowledge' : 'Add Knowledge'}
                        open={modalVisible}
                        onCancel={() => setModalVisible(false)}
                        onOk={handleSubmit}
                    >
                        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                            <label>
                                Category:
                                <Input
                                    value={formState.category}
                                    onChange={e => setFormState(prev => ({...prev, category: e.target.value}))}
                                />
                            </label>
                            <label>
                                Title:
                                <Input
                                    value={formState.title}
                                    onChange={e => setFormState(prev => ({...prev, title: e.target.value}))}
                                />
                            </label>
                            <label>
                                Language:
                                <Input
                                    value={formState.language}
                                    onChange={e => setFormState(prev => ({...prev, language: e.target.value}))}
                                />
                            </label>
                            <label>
                                Content:
                                <Input.TextArea
                                    rows={4}
                                    value={formState.content}
                                    onChange={e => setFormState(prev => ({...prev, content: e.target.value}))}
                                />
                            </label>
                        </div>
                    </Modal>
                </Content>
            </Layout>
        </AdminLayout>
    );
};

export default AdminPage;