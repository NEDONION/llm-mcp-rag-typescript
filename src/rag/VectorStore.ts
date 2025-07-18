/**
 * VectorStoreItem 表示一个向量条目，包含文本内容及其对应的嵌入向量。
 * Represents a single item in the vector store.
 */
export interface VectorStoreItem {
    embedding: number[];   // 文档的嵌入向量
    document: string;      // 文档内容
}

/**
 * VectorStore 是一个内存中的简单向量数据库。
 * 用于添加嵌入向量并基于余弦相似度执行查询。
 *
 * VectorStore is an in-memory store for document embeddings,
 * supporting addition and cosine similarity search.
 */
export default class VectorStore {
    private vectorStore: VectorStoreItem[]; // 存储所有嵌入的数组

    constructor() {
        this.vectorStore = [];
        console.log(`[VectorStore] Initialized empty in-memory vector store.`);
    }

    /**
     * 添加一个文档及其对应的嵌入向量到向量存储中
     * Add a new document and its embedding to the store
     * @param embedding 嵌入向量
     * @param document 文本内容
     */
    async addEmbedding(embedding: number[], document: string) {
        this.vectorStore.push({ embedding, document });
        console.log(`[VectorStore] Added embedding. Current total: ${this.vectorStore.length}`);
    }

    /**
     * 对查询向量执行相似度搜索，返回 topK 个最相似的文档内容
     * Perform a cosine similarity search and return top-K most similar documents
     * @param queryEmbedding 查询向量
     * @param topK 返回的最相似文档数量（默认值为 3）
     * @returns 与查询向量最相似的文档内容列表
     */
    async search(queryEmbedding: number[], topK: number = 3): Promise<string[]> {
        const scored = this.vectorStore.map((item) => ({
            document: item.document,
            score: this.cosineSimilarity(queryEmbedding, item.embedding),
        }));

        const sorted = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        // 按得分从高到低排序，并返回前 topK 个文档
        console.log(`[VectorStore] Search complete. Top ${sorted.length} results selected.`);
        return sorted.map((item, idx) => {
            console.log(`[VectorStore] Result #${idx + 1}: score=${item.score.toFixed(4)}`);
            return item.document;
        });
    }

    /**
     * 计算两个向量之间的余弦相似度
     * Compute cosine similarity between two vectors
     * @param vecA 向量 A
     * @param vecB 向量 B
     * @returns 余弦相似度值（越接近 1 表示越相似）
     */
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
        const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (normA * normB);
    }
}
