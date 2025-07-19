import Embedding from "../models/embedding";
import {logTitle} from "../utils";
import VectorStore from "./VectorStore";
import 'dotenv/config';

/**
 * EmbeddingRetriever 类用于将文档或查询转换为向量，并在本地向量存储中进行相似度检索。
 * EmbeddingRetriever is responsible for generating embeddings for documents/queries
 * and retrieving similar documents from the in-memory vector store.
 */
export default class EmbeddingRetriever {
    private readonly embeddingModel: string;     // 使用的 embedding 模型名称
    private vectorStore: VectorStore;   // 本地向量存储，用于存储和检索嵌入

    /**
     * 构造函数
     * @param embeddingModel 指定用于生成嵌入的模型名称
     */
    constructor(embeddingModel: string) {
        this.embeddingModel = embeddingModel;
        this.vectorStore = new VectorStore();
        console.log(`[Init] EmbeddingRetriever initialized with model: ${embeddingModel}`);
    }

    /**
     * 嵌入一个文档并将其添加到本地向量存储
     * Embed a document and add it to the local vector store
     * @param document 文本内容
     * @returns 文档的嵌入向量
     */
    async embedDocument(document: string): Promise<number[]> {
        logTitle('EMBEDDING DOCUMENT');
        const embedding = await this.embed(document);
        await this.vectorStore.addEmbedding(embedding, document);
        console.log(`[Store] Document embedded and stored.`);
        return embedding;
    }

    /**
     * 嵌入一个查询文本（不添加到存储，仅用于检索）
     * Generate embedding for a query (not stored, used for searching)
     * @param query 查询字符串
     * @returns 查询的嵌入向量
     */
    async embedQuery(query: string): Promise<number[]> {
        logTitle('EMBEDDING QUERY');
        const embedding = await this.embed(query);
        console.log(`[Query] Query vector generated, length: ${embedding.length}`);
        return embedding;
    }

    /**
     * 生成嵌入向量的私有方法
     * Calls external embedding service to get vector representation
     * @param document 要转换的文本
     * @returns 嵌入向量
     */
    async embed(document: string): Promise<number[]> {
        console.log(`[API] Sending text to embedding service...`);
        const response = await fetch(`${process.env.EMBEDDING_BASE_URL}/embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EMBEDDING_KEY}`,
            },
            body: JSON.stringify({
                model: this.embeddingModel,
                input: document,
                encoding_format: 'float',
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error(`[Error] Embedding service failed: ${JSON.stringify(data)}`);
            throw new Error('Embedding API error');
        }

        const vector = data.data[0].embedding;
        console.log(`[API] Received embedding vector, dimension: ${vector.length}`);
        return vector;
    }


    /**
     * 从内存 vector store 中检索最相似的文档（不触发 DB 加载）
     * Retrieve top-k most similar documents from vector store
     * @param query 查询内容
     * @param topK 返回的相似文档数量（默认 3）
     * @returns 匹配到的文本文档数组
     */
    async retrieveFromMemory(query: string, topK: number = 3): Promise<{ document: string; score: number }[]> {
        logTitle('RETRIEVE FROM MEMORY');
        console.log(`[Memory] Query: "${query}", topK: ${topK}`);

        const queryEmbedding = await this.embedQuery(query);
        return this.vectorStore.search(queryEmbedding, topK);
    }

    /**
     * 从数据库加载全部 embedding 到内存后，再执行相似度检索
     * Retrieve similar documents after loading all embeddings from DB
     */
    async retrieveFromDB(query: string, topK: number = 3): Promise<{ document: string; score: number }[]> {
        logTitle('RETRIEVE FROM DB');
        console.log(`[DB] Loading all embeddings from DB...`);

        const queryEmbedding = await this.embedQuery(query);

        const embeddings = await Embedding.find({}, {content: 1, vector: 1}).lean();
        for (const item of embeddings) {
            await this.vectorStore.addEmbedding(item.vector, item.content);
        }

        console.log(`[DB] Loaded ${embeddings.length} embeddings into memory.`);
        return this.vectorStore.search(queryEmbedding, topK);
    }

    /**
     * 将一个向量和对应的内容加载到向量存储中
     */
    loadVector(vector: number[], content: string) {
        return this.vectorStore.addEmbedding(vector, content);
    }


    /**
     * 返回当前内存中的文档摘要列表（不包含向量数据）
     */
    getLoadedEmbeddingSummaries() {
        return this.vectorStore.listEmbeddings();
    }

    /**
     * Get the name of the current embedding model
     */
    getModelName(): string {
        return this.embeddingModel;
    }
}
