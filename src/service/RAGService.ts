import {connectMongo} from "../db/mongoClient";
import EmbeddingRetriever from "../rag/EmbeddingRetriever";
import Knowledge from "../models/knowledge";
import Embedding from "../models/embedding";

class RAGService {
  private retriever: EmbeddingRetriever;

  constructor(embeddingModel = 'BAAI/bge-m3') {
    this.retriever = new EmbeddingRetriever(embeddingModel);
  }

  /**
   * 获取当前加载的所有嵌入向量摘要
   */
  getLoadedEmbeddingSummaries() {
    return this.retriever.getLoadedEmbeddingSummaries();
  }


  async loadFromDB(filter: { language?: string; category?: string; slug?: string }) {
    await connectMongo();
    const docs = await Knowledge.find(filter);
    for (const doc of docs) {
      await this.retriever.embedDocument(doc.content);
    }
  }

  async loadEmbeddingsIntoVectorStoreFromDB() {
    await connectMongo();
    const all = await Embedding.find({}, { vector: 1, content: 1 });
    console.log(`[RAGService] Loading ${all.length} embeddings into memory.`);

    for (const doc of all) {
      await this.retriever.loadVector(doc.vector, doc.content);
    }

    console.log(`[RAGService] Finished loading embeddings to VectorStore.`);
  }

  // 从内存向量中检索相似文档
  async retrieveContextFromMemory(prompt: string, topK: number = 3): Promise<{ document: string; score: number }[]> {
    return await this.retriever.retrieveFromMemory(prompt, topK);
  }

  // 会超时因为不是 向量数据库
  // 从数据库中检索Embedding并计算向量来获取 相似文档
  async retrieveContextFromDB(prompt: string, topK: number = 3): Promise<{ document: string; score: number }[]> {
    return await this.retriever.retrieveFromDB(prompt, topK);
  }

  async saveEmbedding(slug: string) {
    await connectMongo();
    const doc = await Knowledge.findOne({ slug });
  
    if (!doc) {
      throw new Error(`Knowledge with slug "${slug}" not found.`);
    }
  
    const vector = await this.retriever.embed(doc.content);

    const preview = `[${vector
        .slice(0, 5)
        .map((v) => Number(v).toFixed(6))
        .join(', ')}, ... (${vector.length} dims)]`;

    // 保存嵌入向量
    const result = await Embedding.findOneAndUpdate(
        { slug },
        {
          vector,
          content: doc.content,
          model: this.retriever.getModelName(),
          category: doc.category,
          preview
        },
        { upsert: true, new: true }
    );

    // 标记知识文档为 embedded = true
    await Knowledge.findOneAndUpdate(
        { slug },
        { embedded: true }
    );

    return result;
  }

  async getEmbeddingList(filter: { category?: string; model?: string }) {
    await connectMongo();
    const list = await Embedding.find(filter)
      .select('slug model category updatedAt vector preview') // 需要取出 vector 才能计算长度
      .sort({ updatedAt: -1 })
      .lean(); // 转换为普通对象以便修改字段
  
    return list.map(doc => ({
      slug: doc.slug,
      model: doc.model,
      category: doc.category,
      updatedAt: doc.updatedAt,
      vectorDimension: doc.vector?.length ?? 0, // 安全访问
      preview: doc.preview,
    }));
  }
  
  
}

export default RAGService;
