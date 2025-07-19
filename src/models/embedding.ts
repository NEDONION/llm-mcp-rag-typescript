// models/embedding.ts
import mongoose from 'mongoose';

const EmbeddingSchema = new mongoose.Schema({
  slug: { type: String, required: true }, // 对应知识内容的唯一标识
  vector: { type: [Number], required: true }, // 嵌入向量
  model: { type: String, required: true }, // 嵌入模型，例如 "BAAI/bge-m3"
  content: { type: String, required: true }, // 文本内容（可选，仅用于 debug 或检索）
  category: String,
  preview: { type: String },
}, { timestamps: true });

const Embedding = mongoose.models.Embedding || mongoose.model('Embedding', EmbeddingSchema);
export default Embedding;
