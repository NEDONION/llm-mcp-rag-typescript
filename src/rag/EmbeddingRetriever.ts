import { logTitle } from "../utils";
import VectorStore from "./VectorStore";
import 'dotenv/config';

/**
 * EmbeddingRetriever 类用于将文档或查询转换为向量，并在本地向量存储中进行相似度检索。
 * EmbeddingRetriever is responsible for generating embeddings for documents/queries
 * and retrieving similar documents from the in-memory vector store.
 */
export default class EmbeddingRetriever {
    private embeddingModel: string;     // 使用的 embedding 模型名称
    private vectorStore: VectorStore;   // 本地向量存储，用于存储和检索嵌入

    /**
     * 构造函数
     * @param embeddingModel 指定用于生成嵌入的模型名称
     */
    constructor(embeddingModel: string) {
        this.embeddingModel = embeddingModel;
        this.vectorStore = new VectorStore();
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
        this.vectorStore.addEmbedding(embedding, document);
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
        return embedding;
    }

    /**
     * 生成嵌入向量的私有方法
     * Calls external embedding service to get vector representation
     * @param document 要转换的文本
     * @returns 嵌入向量
     */
    private async embed(document: string): Promise<number[]> {
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

        // 控制台输出用于调试（可移除）
        console.log(data.data[0].embedding);

        return data.data[0].embedding;
    }

    /**
     * 基于相似度从 vector store 中检索与 query 最相近的文档
     * Retrieve top-k most similar documents from vector store
     * @param query 查询内容
     * @param topK 返回的相似文档数量（默认 3）
     * @returns 匹配到的文本文档数组
     */
    async retrieve(query: string, topK: number = 3): Promise<string[]> {
        const queryEmbedding = await this.embedQuery(query);
        return this.vectorStore.search(queryEmbedding, topK);
    }
}
