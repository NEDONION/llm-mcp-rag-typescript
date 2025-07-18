import { connectMongo } from "../db/mongoClient";
import EmbeddingRetriever from "../rag/EmbeddingRetriever";
import Knowledge from "../models/Knowledge"; // 👈 确保是模型

class RAGService {
  private retriever: EmbeddingRetriever;

  constructor(embeddingModel = 'BAAI/bge-m3') {
    this.retriever = new EmbeddingRetriever(embeddingModel);
  }

  async loadFromDB(filter: { language?: string; category?: string; slug?: string }) {
    await connectMongo();
    const docs = await Knowledge.find(filter);
    for (const doc of docs) {
      await this.retriever.embedDocument(doc.content);
    }
  }

  async retrieveContext(prompt: string, topK: number = 3): Promise<string> {
    const results = await this.retriever.retrieve(prompt, topK);
    return results.join('\n');
  }
}

export default RAGService;
