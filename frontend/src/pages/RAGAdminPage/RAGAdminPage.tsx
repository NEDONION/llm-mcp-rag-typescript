import React, {useEffect, useState} from 'react';
import {
    Table,
    Button,
    Input,
    message,
    Row,
    Col,
    Typography, Select,
} from 'antd';
import axios from 'axios';
import AdminLayout from '../../../src/components/AdminLayout/AdminLayout.tsx';

const {Title} = Typography;

interface EmbeddingItem {
    slug: string;
    category: string;
    title: string;
    language: string;
    model: string;
    vectorDimension: number;
    createdAt: string;
    preview: string;
}

interface LoadedVectorItem {
    slug: string;
    model: string;
    category: string;
    dimension: number;
}

const RAGAdminPage: React.FC = () => {
    const [embeddings, setEmbeddings] = useState<EmbeddingItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [queryCategory, setQueryCategory] = useState('movie');
    const [queryModel, setQueryModel] = useState('BAAI/bge-m3');
    const [loadSlug, setLoadSlug] = useState('');
    const [loadedVectors, setLoadedVectors] = useState<LoadedVectorItem[]>([]);
    const defaultCategories = ['movie'];
    const defaultModels = ['BAAI/bge-m3'];

    const [categoryOptions, setCategoryOptions] = useState(defaultCategories);
    const [modelOptions, setModelOptions] = useState(defaultModels);

    const handleAddCategory = (value: string) => {
        if (!categoryOptions.includes(value)) {
            setCategoryOptions([...categoryOptions, value]);
        }
        setQueryCategory(value);
    };

    const handleAddModel = (value: string) => {
        if (!modelOptions.includes(value)) {
            setModelOptions([...modelOptions, value]);
        }
        setQueryModel(value);
    };

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

    const fetchLoadedVectors = async () => {
        try {
            const res = await axios.get('/api/rag/vector-store');
            console.log(res);
            setLoadedVectors(res.data.items || []);
        } catch {
            message.error('Failed to fetch vector store summary');
        }
    };


    const handleLoad = async () => {
        try {
            await axios.post('/api/rag/load', {
                category: queryCategory,
                language: 'en',
                slug: loadSlug,
            });
            message.success(`Loaded to memory: ${loadSlug}`);
            fetchLoadedVectors();
        } catch {
            message.error('Failed to load into memory');
        }
    };

    const handleLoadAll = async () => {
        try {
            await axios.post('/api/rag/load-all-embeddings');
            message.success('Loaded all embeddings into memory');
            fetchLoadedVectors();
        } catch {
            message.error('Failed to load all');
        }
    };

    useEffect(() => {
        fetchEmbeddings();
        fetchLoadedVectors();
    }, []);

    return (
        <AdminLayout>
            <Title level={2}>RAG Vector Embeddings</Title>

            <Row gutter={16} style={{marginBottom: 16}}>
                <Col>
                    <Select
                        showSearch
                        value={queryCategory}
                        onChange={handleAddCategory}
                        placeholder="Select or input category"
                        style={{ width: 200 }}
                        options={categoryOptions.map(c => ({ label: c, value: c }))}
                    />
                </Col>
                <Col>
                    <Select
                        showSearch
                        value={queryModel}
                        onChange={handleAddModel}
                        placeholder="Select or input model"
                        style={{ width: 240 }}
                        options={modelOptions.map(m => ({ label: m, value: m }))}
                    />
                </Col>
                <Col><Button type="primary" onClick={fetchEmbeddings}>Query</Button></Col>
                <Col><Button onClick={handleLoadAll}>Load All to Memory</Button></Col>
            </Row>

            <Row gutter={16} style={{marginBottom: 24}}>
                <Col><Input placeholder="Slug to Load" value={loadSlug} onChange={(e) => setLoadSlug(e.target.value)}
                            style={{width: 240}}/></Col>
                <Col><Button type="dashed" onClick={handleLoad}>Load by Slug</Button></Col>
            </Row>

            <Title level={4}>Embedding Table</Title>
            <Table
                rowKey="slug"
                loading={loading}
                dataSource={embeddings}
                columns={[
                    {title: 'Slug', dataIndex: 'slug'},
                    {title: 'Category', dataIndex: 'category'},
                    {title: 'Embedding Model', dataIndex: 'model'},
                    {title: 'Vector Dim', dataIndex: 'vectorDimension'},
                    {
                        title: 'Vector Preview', dataIndex: 'preview'
                    }
                ]}
            />


            <Title level={4} style={{marginTop: 40}}>Currently Loaded Vectors</Title>
            <Table
                rowKey="slug"
                dataSource={loadedVectors}
                pagination={false}
                columns={[
                    {title: 'Index', dataIndex: 'index'},
                    {title: 'Preview', dataIndex: 'preview'},
                ]}
            />
        </AdminLayout>
    );
};

export default RAGAdminPage;