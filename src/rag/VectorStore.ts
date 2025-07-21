/**
 * VectorStoreItem 表示一个向量条目，包含文本内容及其对应的嵌入向量。
 * Represents a single item in the vector store.
 */
export interface VectorStoreItem {
    slugId: string;        // 唯一标识符，如 "movie-inside-out-en"
    embedding: number[];   // 文档的嵌入向量
    document: string;      // 文档内容
}

/**
 * VectorStore 是一个内存中的简单向量数据库。
 * 用于添加嵌入向量并基于余弦相似度执行查询。
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
     * @param slugId 唯一标识符
     * @param embedding 嵌入向量
     * @param document 文本内容
     */
    async addEmbedding(slugId: string, embedding: number[], document: string) {
        // 移除已有 slugId 的条目（如有）
        this.vectorStore = this.vectorStore.filter(item => item.slugId !== slugId);
        this.vectorStore.push({ slugId, embedding, document });
        console.log(`[VectorStore] Added embedding for slugId=${slugId}. Total: ${this.vectorStore.length}`);
    }

    /**
     * 对查询向量执行相似度搜索，返回 topK 个最相似的文档内容
     * Perform a cosine similarity search and return top-K most similar documents
     * @param queryEmbedding 查询向量
     * @param topK 返回的最相似文档数量（默认值为 3）
     * @returns 与查询向量最相似的文档内容列表
     */
    async search(queryEmbedding: number[], topK: number = 3): Promise<{ document: string; score: number }[]> {
        const scored = this.vectorStore.map((item) => ({
            document: item.document,
            score: this.cosineSimilarity(queryEmbedding, item.embedding),
        }));

        const sorted = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        console.log(`[VectorStore] Search complete. Top ${sorted.length} results selected.`);
        sorted.forEach((item, idx) => {
            console.log(`[VectorStore] Result #${idx + 1}: score=${item.score.toFixed(4)}`);
        });

        return sorted;
    }

    /**
     * 返回当前内存中的文档摘要列表（包含 slugId 与 embedding 预览）
     */
    listEmbeddings(): {
        slugId: string;
        index: number;
        preview: string;
        embeddingPreview: string;
    }[] {
        return this.vectorStore.map((item, idx) => {
            const dim = item.embedding.length;
            const sliced = item.embedding.slice(0, 5).map(n => n.toFixed(6));
            const preview = `[${sliced.join(', ')}, ... (${dim} dims)]`;

            return {
                slugId: item.slugId,
                index: idx,
                preview: item.document.slice(0, 50) + '...',
                embeddingPreview: preview,
            };
        });
    }

    /**
     * 根据 slugId 获取指定条目（可选工具）
     */
    getEmbeddingBySlugId(slugId: string): VectorStoreItem | undefined {
        return this.vectorStore.find(item => item.slugId === slugId);
    }

    /**
     * 根据 slugId 移除指定条目（可选工具）
     */
    removeBySlugId(slugId: string): void {
        const before = this.vectorStore.length;
        this.vectorStore = this.vectorStore.filter(item => item.slugId !== slugId);
        const after = this.vectorStore.length;
        console.log(`[VectorStore] Removed slugId=${slugId}. Total changed: ${before} → ${after}`);
    }

    /**
     * 计算两个向量之间的余弦相似度
     */
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
        const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (normA * normB);
    }
}
