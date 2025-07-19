import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Input,
    message,
    Row,
    Col,
    Space,

} from 'antd';
import axios from 'axios';
import AdminLayout from '../../../src/components/AdminLayout/AdminLayout.tsx';

interface EmbeddingItem {
    slug: string;
    category: string;
    title: string;
    language: string;
    model: string;
    vectorDimension: number;
    createdAt: string;
}

const RAGAdminPage: React.FC = () => {
    const [embeddings, setEmbeddings] = useState<EmbeddingItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [queryCategory, setQueryCategory] = useState('movie');
    const [queryModel, setQueryModel] = useState('BAAI/bge-m3');
    const [loadSlug, setLoadSlug] = useState('');

    const fetchEmbeddings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/rag/embeddings', {
                params: {
                    category: queryCategory,
                    model: queryModel,
                },
            });
            setEmbeddings(res.data.list || []);
        } catch {
            message.error('Failed to fetch embeddings');
        } finally {
            setLoading(false);
        }
    };

    const handleEmbed = async (slug: string) => {
        try {
            await axios.post('/api/rag/embed', { slug });
            message.success(`Embedded: ${slug}`);
        } catch {
            message.error('Embedding failed');
        }
    };

    const handleLoad = async () => {
        try {
            await axios.post('/api/rag/load', {
                category: queryCategory,
                language: 'en', // customize if needed
                slug: loadSlug,
            });
            message.success(`Loaded to memory: ${loadSlug}`);
        } catch {
            message.error('Failed to load into memory');
        }
    };

    const handleLoadAll = async () => {
        try {
            await axios.post('/api/rag/load-all-embeddings');
            message.success('Loaded all embeddings into memory');
        } catch {
            message.error('Failed to load all');
        }
    };

    useEffect(() => {
        fetchEmbeddings();
    }, []);

    return (
        <AdminLayout>
            <h2>RAG Vector Embeddings</h2>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col>
                    <Input
                        placeholder="Category (e.g. movie)"
                        value={queryCategory}
                        onChange={(e) => setQueryCategory(e.target.value)}
                        style={{ width: 200 }}
                    />
                </Col>
                <Col>
                    <Input
                        placeholder="Model (e.g. BAAI/bge-m3)"
                        value={queryModel}
                        onChange={(e) => setQueryModel(e.target.value)}
                        style={{ width: 200 }}
                    />
                </Col>
                <Col>
                    <Button type="primary" onClick={fetchEmbeddings}>
                        Query
                    </Button>
                </Col>
                <Col>
                    <Button onClick={handleLoadAll}>Load All to Memory</Button>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col>
                    <Input
                        placeholder="Slug to Load"
                        value={loadSlug}
                        onChange={(e) => setLoadSlug(e.target.value)}
                        style={{ width: 240 }}
                    />
                </Col>
                <Col>
                    <Button type="dashed" onClick={handleLoad}>
                        Load by Slug
                    </Button>
                </Col>
            </Row>

            <Table
                rowKey="slug"
                loading={loading}
                dataSource={embeddings}
                columns={[
                    { title: 'Slug', dataIndex: 'slug' },
                    { title: 'Vector Dim', dataIndex: 'vectorDimension' },
                    {
                        title: 'Actions',
                        render: (_, record) => (
                            <Space>
                                <Button type="link" onClick={() => handleEmbed(record.slug)}>
                                    Embed
                                </Button>
                            </Space>
                        ),
                    },
                ]}
            />
        </AdminLayout>
    );
};

export default RAGAdminPage;
